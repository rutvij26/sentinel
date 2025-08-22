import { SentinelConfig, TestSuggestion, LintIssue } from './types';
import { Logger } from './utils/logger';
export declare class Sentinel {
    private config;
    private octokit;
    private logger;
    private aiProvider;
    private diffFetcher;
    private commenter;
    private cache;
    constructor(config: SentinelConfig, octokit: any, logger: Logger);
    reviewPR(prNumber: number): Promise<void>;
    summarizePR(prNumber: number): Promise<string>;
    explainFile(prNumber: number, filename: string): Promise<string>;
    suggestTests(prNumber: number): Promise<TestSuggestion[]>;
    lintCode(prNumber: number): Promise<LintIssue[]>;
    private getRepoContext;
    private shouldUseCachedReview;
    private postCachedReview;
    private postReviewResults;
    getConfig(): SentinelConfig;
    getLogger(): Logger;
}
//# sourceMappingURL=sentinel.d.ts.map