"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sentinel = void 0;
const ai_provider_factory_1 = require("./ai/ai-provider-factory");
const pr_diff_fetcher_1 = require("./github/pr-diff-fetcher");
const pr_commenter_1 = require("./github/pr-commenter");
const cache_1 = require("./utils/cache");
class Sentinel {
    config;
    octokit;
    logger;
    aiProvider;
    diffFetcher;
    commenter;
    cache;
    constructor(config, octokit, logger) {
        this.config = config;
        this.octokit = octokit;
        this.logger = logger;
        this.aiProvider = ai_provider_factory_1.AIProviderFactory.createProvider(config, logger);
        this.diffFetcher = new pr_diff_fetcher_1.PRDiffFetcher(logger);
        this.commenter = new pr_commenter_1.PRCommenter(logger);
        this.cache = new cache_1.Cache();
    }
    async reviewPR(prNumber) {
        try {
            this.logger.info(`Starting review for PR #${prNumber}`);
            // Get repository context
            const { owner, repo } = await this.getRepoContext();
            // Fetch PR diff
            const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);
            // Check cache for existing review
            const cacheKey = `review_${owner}_${repo}_${prNumber}`;
            const cachedReview = this.cache.get(cacheKey);
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
        }
        catch (error) {
            this.logger.error(`Review failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async summarizePR(prNumber) {
        try {
            this.logger.info(`Generating summary for PR #${prNumber}`);
            const { owner, repo } = await this.getRepoContext();
            const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);
            return await this.aiProvider.summarizePR(diff);
        }
        catch (error) {
            this.logger.error(`Summary generation failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async explainFile(prNumber, filename) {
        try {
            this.logger.info(`Explaining file ${filename} in PR #${prNumber}`);
            const { owner, repo } = await this.getRepoContext();
            const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);
            const file = diff.files.find((f) => f.filename === filename);
            if (!file) {
                throw new Error(`File ${filename} not found in PR #${prNumber}`);
            }
            return await this.aiProvider.explainFile(file);
        }
        catch (error) {
            this.logger.error(`File explanation failed for ${filename} in PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async suggestTests(prNumber) {
        try {
            this.logger.info(`Generating test suggestions for PR #${prNumber}`);
            const { owner, repo } = await this.getRepoContext();
            const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);
            return await this.aiProvider.suggestTests(diff);
        }
        catch (error) {
            this.logger.error(`Test suggestions failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async lintCode(prNumber) {
        try {
            this.logger.info(`Running lint analysis for PR #${prNumber}`);
            const { owner, repo } = await this.getRepoContext();
            const diff = await this.diffFetcher.fetchDiff(this.octokit, owner, repo, prNumber);
            return await this.aiProvider.lintCode(diff);
        }
        catch (error) {
            this.logger.error(`Lint analysis failed for PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async getRepoContext() {
        // This would typically come from the GitHub context
        // For now, we'll use environment variables or default values
        const owner = process.env.GITHUB_REPOSITORY_OWNER || 'unknown';
        const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'unknown';
        return { owner, repo };
    }
    shouldUseCachedReview(diff) {
        // Check if the diff has changed significantly
        // For now, we'll use a simple heuristic based on total changes
        const cacheKey = `diff_hash_${diff.totalChanges}_${diff.files.length}`;
        const cachedHash = this.cache.get(cacheKey);
        if (!cachedHash) {
            this.cache.set(cacheKey, 'current', 3600000);
            return false;
        }
        return true;
    }
    async postCachedReview(owner, repo, prNumber, review) {
        this.logger.info('Posting cached review results');
        await this.commenter.postReviewSummary(this.octokit, owner, repo, prNumber, review);
        if (this.config.review.commentOnFiles && review.comments.length > 0) {
            await this.commenter.postFileComments(this.octokit, owner, repo, prNumber, review.comments);
        }
    }
    async postReviewResults(owner, repo, prNumber, review) {
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
    getConfig() {
        return this.config;
    }
    getLogger() {
        return this.logger;
    }
}
exports.Sentinel = Sentinel;
//# sourceMappingURL=sentinel.js.map