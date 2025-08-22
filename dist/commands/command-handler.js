"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const re_review_command_1 = require("./re-review-command");
const summarize_command_1 = require("./summarize-command");
const explain_command_1 = require("./explain-command");
const lint_command_1 = require("./lint-command");
const tests_command_1 = require("./tests-command");
const help_command_1 = require("./help-command");
class CommandHandler {
    commands;
    logger;
    constructor(logger) {
        this.logger = logger;
        this.commands = new Map();
        this.registerCommands();
    }
    registerCommands() {
        this.commands.set('re-review', new re_review_command_1.ReReviewCommand());
        this.commands.set('summarize', new summarize_command_1.SummarizeCommand());
        this.commands.set('explain', new explain_command_1.ExplainCommand());
        this.commands.set('lint', new lint_command_1.LintCommand());
        this.commands.set('tests', new tests_command_1.TestsCommand());
        this.commands.set('help', new help_command_1.HelpCommand());
    }
    async handleCommand(commentBody, context) {
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
            const commandInstance = this.commands.get(command.name);
            await commandInstance.execute(context);
        }
        catch (error) {
            this.logger.error(`Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await this.postErrorResponse(context, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    parseCommand(commentBody) {
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
    async postUnknownCommandResponse(context, commandName) {
        const helpCommand = this.commands.get('help');
        await helpCommand.execute({
            ...context,
            commentBody: `/help ${commandName}`,
        });
    }
    async postErrorResponse(context, errorMessage) {
        try {
            await context.octokit.rest.issues.createComment({
                owner: context.owner,
                repo: context.repository,
                issue_number: context.prNumber,
                body: `❌ **Command Error**\n\nAn error occurred while processing your command:\n\`\`\`\n${errorMessage}\n\`\`\`\n\nUse \`/help\` to see available commands.`,
            });
        }
        catch (commentError) {
            this.logger.error(`Failed to post error response: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`);
        }
    }
    getAvailableCommands() {
        return Array.from(this.commands.values());
    }
    getCommand(name) {
        return this.commands.get(name);
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=command-handler.js.map