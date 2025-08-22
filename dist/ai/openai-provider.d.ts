import { AIProvider, PRDiff, ReviewResult, TestSuggestion, LintIssue, SentinelConfig, ChangedFile } from '../types';
import { Logger } from '../utils/logger';
export declare class OpenAIProvider implements AIProvider {
    private client;
    private rateLimiter;
    private logger;
    private config;
    constructor(apiKey: string, config: SentinelConfig, logger: Logger);
    reviewCode(diff: PRDiff): Promise<ReviewResult>;
    summarizePR(diff: PRDiff): Promise<string>;
    explainFile(file: ChangedFile): Promise<string>;
    suggestTests(diff: PRDiff): Promise<TestSuggestion[]>;
    lintCode(diff: PRDiff): Promise<LintIssue[]>;
    private waitForRateLimit;
    private buildReviewPrompt;
    private buildSummaryPrompt;
    private buildExplainPrompt;
    private buildTestPrompt;
    private buildLintPrompt;
    private parseReviewResponse;
    private parseTestSuggestions;
    private parseLintIssues;
}
//# sourceMappingURL=openai-provider.d.ts.map