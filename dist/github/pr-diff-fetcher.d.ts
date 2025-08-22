import { PRDiff } from '../types';
import { Logger } from '../utils/logger';
export declare class PRDiffFetcher {
    private logger;
    constructor(logger: Logger);
    fetchDiff(octokit: any, owner: string, repo: string, prNumber: number): Promise<PRDiff>;
    private parseDiff;
    private extractFilename;
    private parseStatsLine;
    private createChangedFile;
    fetchFileContent(octokit: any, owner: string, repo: string, path: string, ref: string): Promise<string | null>;
}
//# sourceMappingURL=pr-diff-fetcher.d.ts.map