import { ReviewResult, ReviewComment, TestSuggestion, LintIssue } from '../types';
import { Logger } from '../utils/logger';
export declare class PRCommenter {
    private logger;
    constructor(logger: Logger);
    postReviewSummary(octokit: any, owner: string, repo: string, prNumber: number, review: ReviewResult): Promise<void>;
    postFileComments(octokit: any, owner: string, repo: string, prNumber: number, comments: ReviewComment[]): Promise<void>;
    postTestSuggestions(octokit: any, owner: string, repo: string, prNumber: number, tests: TestSuggestion[]): Promise<void>;
    postLintIssues(octokit: any, owner: string, repo: string, prNumber: number, issues: LintIssue[]): Promise<void>;
    private buildSummaryComment;
    private buildTestSuggestionsComment;
    private buildLintIssuesComment;
    private groupCommentsByFile;
    private postFileReview;
    private formatCommentBody;
}
//# sourceMappingURL=pr-commenter.d.ts.map