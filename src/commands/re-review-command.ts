import { Command, CommandContext } from '../types';

export class ReReviewCommand implements Command {
  name = 're-review';
  description = 'Re-run the AI review for the current pull request';
  usage = '/re-review';

  async execute(context: CommandContext): Promise<void> {
    try {
      // Post a status comment
      await context.octokit.rest.issues.createComment({
        owner: context.owner,
        repo: context.repository,
        issue_number: context.prNumber,
        body: '🔄 **Re-review requested**\n\nSentinel AI is re-analyzing your pull request. This may take a few moments...',
      });

      // Trigger a new review
      await context.sentinel.reviewPR(context.prNumber);
    } catch (error) {
      throw new Error(
        `Failed to execute re-review command: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
