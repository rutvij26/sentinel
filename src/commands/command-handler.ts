import { Command, CommandContext } from '../types';
import { ReReviewCommand } from './re-review-command';
import { SummarizeCommand } from './summarize-command';
import { ExplainCommand } from './explain-command';
import { LintCommand } from './lint-command';
import { TestsCommand } from './tests-command';
import { HelpCommand } from './help-command';
import { Logger } from '../utils/logger';

export class CommandHandler {
  private commands: Map<string, Command>;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.commands = new Map();
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commands.set('re-review', new ReReviewCommand());
    this.commands.set('summarize', new SummarizeCommand());
    this.commands.set('explain', new ExplainCommand());
    this.commands.set('lint', new LintCommand());
    this.commands.set('tests', new TestsCommand());
    this.commands.set('help', new HelpCommand());
  }

  async handleCommand(commentBody: string, context: CommandContext): Promise<void> {
    try {
      const command = this.parseCommand(commentBody);

      if (!command) {
        this.logger.info('No command found in comment');
        return;
      }

      if (!this.commands.has(command.name)) {
        await this.postUnknownCommandResponse(context, command.name);
        return;
      }

      this.logger.info(`Executing command: ${command.name}`);
      const commandInstance = this.commands.get(command.name)!;
      await commandInstance.execute(context);
    } catch (error) {
      this.logger.error(
        `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      await this.postErrorResponse(
        context,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private parseCommand(commentBody: string): { name: string; args: string[] } | null {
    const lines = commentBody.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Look for command patterns like /command or /command arg1 arg2
      if (trimmed.startsWith('/')) {
        const parts = trimmed.substring(1).split(/\s+/);
        const name = parts[0].toLowerCase();
        const args = parts.slice(1);

        return { name, args };
      }
    }

    return null;
  }

  private async postUnknownCommandResponse(
    context: CommandContext,
    commandName: string
  ): Promise<void> {
    const helpCommand = this.commands.get('help')!;
    await helpCommand.execute({
      ...context,
      commentBody: `/help ${commandName}`,
    });
  }

  private async postErrorResponse(context: CommandContext, errorMessage: string): Promise<void> {
    try {
      await context.octokit.rest.issues.createComment({
        owner: context.owner,
        repo: context.repository,
        issue_number: context.prNumber,
        body: `❌ **Command Error**\n\nAn error occurred while processing your command:\n\`\`\`\n${errorMessage}\n\`\`\`\n\nUse \`/help\` to see available commands.`,
      });
    } catch (commentError) {
      this.logger.error(
        `Failed to post error response: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`
      );
    }
  }

  getAvailableCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }
}
