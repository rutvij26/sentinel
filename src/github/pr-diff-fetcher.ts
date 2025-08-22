import { PRDiff, ChangedFile } from '../types';
import { Logger } from '../utils/logger';

export class PRDiffFetcher {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async fetchDiff(octokit: any, owner: string, repo: string, prNumber: number): Promise<PRDiff> {
    try {
      this.logger.info(`Fetching diff for PR #${prNumber}`);

      const response = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff',
        },
      });

      const diffText = response.data;
      const files = await this.parseDiff(diffText);

      const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
      const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);
      const totalChanges = totalAdditions + totalDeletions;

      this.logger.info(`Parsed diff: ${files.length} files, +${totalAdditions} -${totalDeletions}`);

      return {
        files,
        totalAdditions,
        totalDeletions,
        totalChanges,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch PR diff: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  private async parseDiff(diffText: string): Promise<ChangedFile[]> {
    const files: ChangedFile[] = [];
    const lines = diffText.split('\n');

    let currentFile: Partial<ChangedFile> | null = null;
    let currentPatch: string[] = [];

    for (const line of lines) {
      // File header line (e.g., "diff --git a/src/file.ts b/src/file.ts")
      if (line.startsWith('diff --git')) {
        if (currentFile && currentFile.filename) {
          files.push(this.createChangedFile(currentFile, currentPatch));
        }

        const filename = this.extractFilename(line);
        currentFile = { filename, patch: '' };
        currentPatch = [];
        continue;
      }

      // File mode line (e.g., "new file mode 100644")
      if (line.startsWith('new file mode')) {
        if (currentFile) currentFile.status = 'added';
        continue;
      }

      // File deletion line (e.g., "deleted file mode 100644")
      if (line.startsWith('deleted file mode')) {
        if (currentFile) currentFile.status = 'removed';
        continue;
      }

      // File rename line (e.g., "rename from src/old.ts")
      if (line.startsWith('rename from')) {
        if (currentFile) currentFile.status = 'renamed';
        continue;
      }

      // Index line (e.g., "index 1234567..89abcdef 100644")
      if (line.startsWith('index ')) {
        continue;
      }

      // Binary file indicator
      if (line.startsWith('Binary files')) {
        if (currentFile) {
          currentFile.status = currentFile.status || 'modified';
          currentFile.additions = 0;
          currentFile.deletions = 0;
          currentFile.changes = 0;
        }
        continue;
      }

      // Stats line (e.g., "@@ -1,3 +1,5 @@")
      if (line.startsWith('@@')) {
        if (currentFile) {
          const stats = this.parseStatsLine(line);
          if (stats) {
            currentFile.additions = stats.additions;
            currentFile.deletions = stats.deletions;
            currentFile.changes = stats.additions + stats.deletions;
          }
        }
        continue;
      }

      // Content lines
      if (currentFile) {
        currentPatch.push(line);
      }
    }

    // Add the last file
    if (currentFile && currentFile.filename) {
      files.push(this.createChangedFile(currentFile, currentPatch));
    }

    return files;
  }

  private extractFilename(line: string): string {
    // Extract filename from "diff --git a/src/file.ts b/src/file.ts"
    const match = line.match(/diff --git a\/(.+) b\/(.+)/);
    if (match) {
      return match[1]; // Use the "from" filename
    }
    return 'unknown';
  }

  private parseStatsLine(line: string): { additions: number; deletions: number } | null {
    // Parse "@@ -1,3 +1,5 @@" format
    const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (match) {
      const additions = parseInt(match[2] || '1', 10);
      const deletions = parseInt(match[1] || '1', 10);
      return { additions, deletions };
    }
    return null;
  }

  private createChangedFile(file: Partial<ChangedFile>, patch: string[]): ChangedFile {
    return {
      filename: file.filename!,
      status: file.status || 'modified',
      additions: file.additions || 0,
      deletions: file.deletions || 0,
      changes: file.changes || 0,
      patch: patch.join('\n'),
    };
  }

  async fetchFileContent(
    octokit: any,
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string | null> {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if (response.data.type === 'file') {
        // Content is base64 encoded
        return Buffer.from(response.data.content, 'base64').toString('utf8');
      }

      return null;
    } catch (error) {
      this.logger.warning(
        `Failed to fetch file content for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  }
}
