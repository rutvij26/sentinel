import { SentinelConfig, PRDiff, ReviewResult, TestSuggestion, LintIssue } from './types';
import { AIProviderFactory } from './ai/ai-provider-factory';
import { PRDiffFetcher } from './github/pr-diff-fetcher';
import { PRCommenter } from './github/pr-commenter';
import { Logger } from './utils/logger';
import { Cache } from './utils/cache';

export class Sentinel {
  private config: SentinelConfig;
  private octokit: any;
  private logger: Logger;
  private aiProvider: any;
  private diffFetcher: PRDiffFetcher;
  private commenter: PRCommenter;
  private cache: Cache;

  constructor(config: SentinelConfig, octokit: any, logger: Logger) {
    this.config = config;
    this.octokit = octokit;
    this.logger = logger;
    this.aiProvider = AIProviderFactory.createProvider(config, logger);
    this.diffFetcher = new PRDiffFetcher(logger);
    this.commenter = new PRCommenter(logger);
    this.cache = new Cache();
  }

  async reviewPR(prNumber: number): Promise<void> {
    try {
      this.logger.info(`Starting review for PR #${prNumber}`);

      // Get repository context
      const { owner, repo } = await this.getRepoContext();

      // Fetch PR diff
      const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);

      // Check cache for existing review
      const cacheKey = `review_${owner}_${repo}_${prNumber}`;
      const cachedReview = this.cache.get<ReviewResult>(cacheKey);

      if (cachedReview && this.shouldUseCachedReview(diff)) {
        this.logger.info('Using cached review');
        await this.postCachedReview(owner, repo, prNumber, cachedReview);
        return;
      }

      // Perform AI review
      this.logger.info('Performing AI review');
      const review = await this.aiProvider.reviewCode(diff);

      // Cache the review
      this.cache.set(cacheKey, review, 3600000); // Cache for 1 hour

      // Post review results
      await this.postReviewResults(owner, repo, prNumber, review);

      this.logger.info(`Review completed for PR #${prNumber}`);
    } catch (error) {
      this.logger.error(
        `Review failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async summarizePR(prNumber: number): Promise<string> {
    try {
      this.logger.info(`Generating summary for PR #${prNumber}`);

      const { owner, repo } = await this.getRepoContext();
      const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);

      return await this.aiProvider.summarizePR(diff);
    } catch (error) {
      this.logger.error(
        `Summary generation failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async explainFile(prNumber: number, filename: string): Promise<string> {
    try {
      this.logger.info(`Explaining file ${filename} in PR #${prNumber}`);

      const { owner, repo } = await this.getRepoContext();
      const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);

      const file = diff.files.find((f) => f.filename === filename);
      if (!file) {
        throw new Error(`File ${filename} not found in PR #${prNumber}`);
      }

      return await this.aiProvider.explainFile(file);
    } catch (error) {
      this.logger.error(
        `File explanation failed for ${filename} in PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async suggestTests(prNumber: number): Promise<TestSuggestion[]> {
    try {
      this.logger.info(`Generating test suggestions for PR #${prNumber}`);

      const { owner, repo } = await this.getRepoContext();
      const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);

      return await this.aiProvider.suggestTests(diff);
    } catch (error) {
      this.logger.error(
        `Test suggestions failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async lintCode(prNumber: number): Promise<LintIssue[]> {
    try {
      this.logger.info(`Running lint analysis for PR #${prNumber}`);

      const { owner, repo } = await this.getRepoContext();
      const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);

      return await this.aiProvider.lintCode(diff);
    } catch (error) {
      this.logger.error(
        `Lint analysis failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  private async getRepoContext(): Promise<{ owner: string; repo: string }> {
    // This would typically come from the GitHub context
    // For now, we'll use environment variables or default values
    const owner = process.env.GITHUB_REPOSITORY_OWNER || 'unknown';
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'unknown';

    return { owner, repo };
  }

  private shouldUseCachedReview(diff: PRDiff): boolean {
    // Check if the diff has changed significantly
    // For now, we'll use a simple heuristic based on total changes
    const cacheKey = `diff_hash_${diff.totalChanges}_${diff.files.length}`;
    const cachedHash = this.cache.get<string>(cacheKey);

    if (!cachedHash) {
      this.cache.set(cacheKey, 'current', 3600000);
      return false;
    }

    return true;
  }

  private async postCachedReview(
    owner: string,
    repo: string,
    prNumber: number,
    review: ReviewResult
  ): Promise<void> {
    this.logger.info('Posting cached review results');

    await this.commenter.postReviewSummary(this.octokit, owner, repo, prNumber, review);

    if (this.config.review.commentOnFiles && review.comments.length > 0) {
      await this.commenter.postFileComments(this.octokit, owner, repo, prNumber, review.comments);
    }
  }

  private async postReviewResults(
    owner: string,
    repo: string,
    prNumber: number,
    review: ReviewResult
  ): Promise<void> {
    this.logger.info('Posting review results');

    // Post main review summary
    await this.commenter.postReviewSummary(this.octokit, owner, repo, prNumber, review);

    // Post file-specific comments if enabled
    if (this.config.review.commentOnFiles && review.comments.length > 0) {
      await this.commenter.postFileComments(this.octokit, owner, repo, prNumber, review.comments);
    }

    // Post test suggestions if enabled
    if (this.config.review.suggestTests && review.tests && review.tests.length > 0) {
      await this.commenter.postTestSuggestions(this.octokit, owner, repo, prNumber, review.tests);
    }

    // Post lint issues if enabled
    if (this.config.review.suggestLinting && review.lintIssues && review.lintIssues.length > 0) {
      await this.commenter.postLintIssues(this.octokit, owner, repo, prNumber, review.lintIssues);
    }
  }

  getConfig(): SentinelConfig {
    return this.config;
  }

  getLogger(): Logger {
    return this.logger;
  }
}
