"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
const command_handler_1 = require("../commands/command-handler");
class EventHandler {
    sentinel;
    commandHandler;
    logger;
    constructor(sentinel, logger) {
        this.sentinel = sentinel;
        this.commandHandler = new command_handler_1.CommandHandler(logger);
        this.logger = logger;
    }
    async handleEvent(context) {
        try {
            this.logger.info(`Handling event: ${context.eventName}`);
            switch (context.eventName) {
                case 'pull_request':
                    await this.handlePullRequestEvent(context);
                    break;
                case 'issue_comment':
                    await this.handleIssueCommentEvent(context);
                    break;
                case 'pull_request_review':
                    await this.handlePullRequestReviewEvent(context);
                    break;
                default:
                    this.logger.info(`Unhandled event type: ${context.eventName}`);
            }
        }
        catch (error) {
            this.logger.error(`Event handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async handlePullRequestEvent(context) {
        const { action, pull_request } = context.payload;
        if (!pull_request) {
            this.logger.warning('No pull request data in payload');
            return;
        }
        this.logger.info(`Processing PR event: ${action} for PR #${pull_request.number}`);
        switch (action) {
            case 'opened':
            case 'synchronize':
            case 'reopened':
                if (this.sentinel.getConfig().review.autoReview) {
                    await this.sentinel.reviewPR(pull_request.number);
                }
                break;
            case 'closed':
                this.logger.info(`PR #${pull_request.number} was closed`);
                break;
            default:
                this.logger.info(`Unhandled PR action: ${action}`);
        }
    }
    async handleIssueCommentEvent(context) {
        const { action, issue, comment } = context.payload;
        if (!issue || !comment) {
            this.logger.warning('No issue or comment data in payload');
            return;
        }
        // Only process comments on pull requests
        if (!issue.pull_request) {
            this.logger.info('Comment is not on a pull request, skipping');
            return;
        }
        this.logger.info(`Processing comment event: ${action} on PR #${issue.number}`);
        if (action === 'created') {
            await this.handleCommentCommand(issue.number, comment.body, comment.user?.login || 'unknown');
        }
    }
    async handlePullRequestReviewEvent(context) {
        const { action, pull_request, review } = context.payload;
        if (!pull_request || !review) {
            this.logger.warning('No pull request or review data in payload');
            return;
        }
        this.logger.info(`Processing PR review event: ${action} on PR #${pull_request.number}`);
        // You could add logic here to respond to review events if needed
        // For example, analyzing review feedback or providing additional insights
    }
    async handleCommentCommand(prNumber, commentBody, commentAuthor) {
        try {
            // Check if commands are enabled
            if (!this.sentinel.getConfig().commands.enabled) {
                this.logger.info('Commands are disabled, skipping comment processing');
                return;
            }
            // Check if the comment contains a command
            if (!this.containsCommand(commentBody)) {
                this.logger.info('Comment does not contain a command, skipping');
                return;
            }
            // Check if user is allowed to use commands
            if (!this.isUserAllowed(commentAuthor)) {
                this.logger.info(`User ${commentAuthor} is not allowed to use commands`);
                return;
            }
            this.logger.info(`Processing command from user ${commentAuthor}: ${commentBody}`);
            // Get repository context
            const { owner, repo } = await this.getRepoContext();
            // Create command context
            const commandContext = {
                prNumber,
                repository: repo,
                owner,
                commentBody,
                commentAuthor,
                octokit: this.sentinel['octokit'], // Access the octokit instance
                sentinel: this.sentinel,
            };
            // Execute the command
            await this.commandHandler.handleCommand(commentBody, commandContext);
        }
        catch (error) {
            this.logger.error(`Command processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Try to post an error comment
            try {
                const { owner, repo } = await this.getRepoContext();
                await this.sentinel['octokit'].rest.issues.createComment({
                    owner,
                    repo,
                    issue_number: prNumber,
                    body: `❌ **Command Error**\n\nAn error occurred while processing your command:\n\`\`\`\n${error instanceof Error ? error.message : 'Unknown error'}\n\`\`\`\n\nPlease try again or use \`/help\` for assistance.`,
                });
            }
            catch (commentError) {
                this.logger.error(`Failed to post error comment: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`);
            }
        }
    }
    containsCommand(commentBody) {
        const lines = commentBody.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('/')) {
                return true;
            }
        }
        return false;
    }
    isUserAllowed(username) {
        const config = this.sentinel.getConfig();
        // If no allowed users are specified, allow all users
        if (!config.commands.allowedUsers || config.commands.allowedUsers.length === 0) {
            return true;
        }
        return config.commands.allowedUsers.includes(username);
    }
    async getRepoContext() {
        // This would typically come from the GitHub context
        // For now, we'll use environment variables or default values
        const owner = process.env.GITHUB_REPOSITORY_OWNER || 'unknown';
        const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'unknown';
        return { owner, repo };
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=event-handler.js.map