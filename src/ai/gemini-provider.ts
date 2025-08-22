import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  PRDiff,
  ReviewResult,
  TestSuggestion,
  LintIssue,
  SentinelConfig,
  ChangedFile,
} from '../types';
import { RateLimiter } from '../utils/rate-limiter';
import { Logger } from '../utils/logger';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private rateLimiter: RateLimiter;
  private logger: Logger;
  private config: SentinelConfig;

  constructor(apiKey: string, config: SentinelConfig, logger: Logger) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.model });
    this.rateLimiter = new RateLimiter(config.rateLimit.requestsPerMinute);
    this.logger = logger;
    this.config = config;
  }

  async reviewCode(diff: PRDiff): Promise<ReviewResult> {
    await this.waitForRateLimit();

    try {
      const prompt = this.buildReviewPrompt(diff);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response content from Gemini');
      }

      return this.parseReviewResponse(content);
    } catch (error) {
      this.logger.error(
        `Gemini review failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async summarizePR(diff: PRDiff): Promise<string> {
    await this.waitForRateLimit();

    try {
      const prompt = this.buildSummaryPrompt(diff);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return content || 'Unable to generate summary';
    } catch (error) {
      this.logger.error(
        `Gemini summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async explainFile(file: ChangedFile): Promise<string> {
    await this.waitForRateLimit();

    try {
      const prompt = this.buildExplainPrompt(file);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return content || 'Unable to explain file changes';
    } catch (error) {
      this.logger.error(
        `Gemini explain failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  async suggestTests(diff: PRDiff): Promise<TestSuggestion[]> {
    await this.waitForRateLimit();

    try {
      const prompt = this.buildTestPrompt(diff);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        return [];
      }

      return this.parseTestSuggestions(content);
    } catch (error) {
      this.logger.error(
        `Gemini test suggestions failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return [];
    }
  }

  async lintCode(diff: PRDiff): Promise<LintIssue[]> {
    await this.waitForRateLimit();

    try {
      const prompt = this.buildLintPrompt(diff);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        return [];
      }

      return this.parseLintIssues(content);
    } catch (error) {
      this.logger.error(
        `Gemini lint failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return [];
    }
  }

  private async waitForRateLimit(): Promise<void> {
    if (!this.rateLimiter.canMakeRequest()) {
      this.logger.info('Rate limit reached, waiting for next window...');
      await this.rateLimiter.waitForNextWindow();
    }
    this.rateLimiter.recordRequest();
  }

  private buildReviewPrompt(diff: PRDiff): string {
    const depthInstructions = {
      light: 'Provide a high-level review focusing on major issues only.',
      normal: 'Provide a balanced review covering functionality, security, and best practices.',
      deep: 'Provide an in-depth review covering all aspects including edge cases, performance, and maintainability.',
    };

    return `
Review Depth: ${depthInstructions[this.config.reviewDepth]}

Pull Request Summary:
- Total files changed: ${diff.files.length}
- Total additions: ${diff.totalAdditions}
- Total deletions: ${diff.totalDeletions}
- Total changes: ${diff.totalChanges}

Files changed:
${diff.files
  .map(
    (file) => `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
${file.patch ? `Patch:\n${file.patch}` : ''}
`
  )
  .join('\n')}

Please provide:
1. A summary of the changes
2. Specific comments on code quality, potential issues, and suggestions
3. Security considerations
4. Performance implications
5. Overall assessment

Format your response as JSON with the following structure:
{
  "summary": "Brief summary",
  "comments": [
    {
      "path": "file path",
      "line": line_number,
      "body": "comment text",
      "type": "suggestion|question|bug|praise"
    }
  ],
  "suggestions": ["general suggestions"]
}
`;
  }

  private buildSummaryPrompt(diff: PRDiff): string {
    return `
Summarize the following pull request changes:

Files changed: ${diff.files.length}
Total additions: ${diff.totalAdditions}
Total deletions: ${diff.totalDeletions}

Files:
${diff.files.map((file) => `- ${file.filename} (${file.status})`).join('\n')}

Provide a concise, professional summary suitable for team communication.
`;
  }

  private buildExplainPrompt(file: ChangedFile): string {
    return `
Explain the changes made to this file:

File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}

${file.patch ? `Patch:\n${file.patch}` : ''}

Explain what was changed, why it was changed, and the impact of these changes.
`;
  }

  private buildTestPrompt(diff: PRDiff): string {
    return `
Suggest test cases for the following code changes:

Files changed: ${diff.files.length}
${diff.files
  .map(
    (file) => `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
`
  )
  .join('\n')}

Provide test suggestions including:
1. Unit test cases
2. Integration test scenarios
3. Edge cases to consider
4. Test data requirements

Format as JSON:
[
  {
    "file": "file path",
    "testCases": ["test case 1", "test case 2"],
    "description": "what to test"
  }
]
`;
  }

  private buildLintPrompt(diff: PRDiff): string {
    return `
Analyze the code quality and identify potential issues:

Files changed: ${diff.files.length}
${diff.files
  .map(
    (file) => `
File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} -${file.deletions}
${file.patch ? `Patch:\n${file.patch}` : ''}
`
  )
  .join('\n')}

Identify:
1. Code style violations
2. Potential bugs
3. Performance issues
4. Security concerns
5. Best practice violations

Format as JSON:
[
  {
    "file": "file path",
    "line": line_number,
    "message": "issue description",
    "severity": "error|warning|info",
    "rule": "best practice rule"
  }
]
`;
  }

  private parseReviewResponse(content: string): ReviewResult {
    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || 'Review completed',
        comments: parsed.comments || [],
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      this.logger.warning('Failed to parse Gemini response as JSON, using fallback');
      return {
        summary: content.substring(0, 500) + '...',
        comments: [],
        suggestions: [content],
      };
    }
  }

  private parseTestSuggestions(content: string): TestSuggestion[] {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      this.logger.warning('Failed to parse test suggestions as JSON');
      return [];
    }
  }

  private parseLintIssues(content: string): LintIssue[] {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      this.logger.warning('Failed to parse lint issues as JSON');
      return [];
    }
  }
}
