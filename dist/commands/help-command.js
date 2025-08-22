"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
class HelpCommand {
    name = 'help';
    description = 'Show available commands and usage';
    usage = '/help [command]';
    async execute(context) {
        try {
            const args = this.parseArgs(context.commentBody);
            if (args.commandName) {
                await this.showCommandHelp(context, args.commandName);
            }
            else {
                await this.showGeneralHelp(context);
            }
        }
        catch (error) {
            throw new Error(`Failed to execute help command: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    parseArgs(commentBody) {
        const lines = commentBody.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('/help')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                    return { commandName: parts[1].toLowerCase() };
                }
            }
        }
        return { commandName: null };
    }
    async showGeneralHelp(context) {
        const body = `## 🤖 Sentinel AI Commands

Sentinel AI provides the following commands for pull request management:

### 📝 Review Commands
- \`/re-review\` - Re-run the AI review for the current PR
- \`/summarize\` - Generate a summary of the PR changes

### 🔍 Analysis Commands
- \`/explain <file>\` - Explain changes in a specific file
- \`/lint\` - Run a lint review using the AI model
- \`/tests\` - Suggest test cases for the changes

### ❓ Help
- \`/help\` - Show this help message
- \`/help <command>\` - Show detailed help for a specific command

### 💡 Usage Examples
\`\`\`
/explain src/main.ts
/re-review
/summarize
\`\`\`

---

*Sentinel AI automatically reviews your pull requests and responds to commands. Use these commands to get additional insights and analysis.*`;
        await context.octokit.rest.issues.createComment({
            owner: context.owner,
            repo: context.repository,
            issue_number: context.prNumber,
            body,
        });
    }
    async showCommandHelp(context, commandName) {
        const commands = {
            're-review': {
                description: 'Re-run the AI review for the current pull request',
                usage: '/re-review',
                details: "This command triggers Sentinel AI to re-analyze your pull request and provide a fresh review. Useful when you've made changes based on previous feedback.",
                examples: ['/re-review'],
            },
            summarize: {
                description: 'Generate a summary of the pull request changes',
                usage: '/summarize',
                details: 'Creates a concise summary of all changes in your pull request, suitable for team communication and documentation.',
                examples: ['/summarize'],
            },
            explain: {
                description: 'Explain changes in a specific file',
                usage: '/explain <filename>',
                details: 'Provides a detailed explanation of what was changed in a specific file, why it was changed, and the impact of these changes.',
                examples: ['/explain src/main.ts', '/explain package.json'],
            },
            lint: {
                description: 'Run a lint review using the AI model',
                usage: '/lint',
                details: 'Analyzes code quality and identifies potential issues including style violations, potential bugs, performance issues, and security concerns.',
                examples: ['/lint'],
            },
            tests: {
                description: 'Suggest test cases for the changes',
                usage: '/tests',
                details: 'Generates comprehensive test suggestions including unit tests, integration tests, edge cases, and test data requirements.',
                examples: ['/tests'],
            },
            help: {
                description: 'Show available commands and usage',
                usage: '/help [command]',
                details: 'Displays help information. Use without arguments to see all commands, or specify a command name for detailed help.',
                examples: ['/help', '/help explain'],
            },
        };
        const command = commands[commandName];
        if (!command) {
            await context.octokit.rest.issues.createComment({
                owner: context.owner,
                repo: context.repository,
                issue_number: context.prNumber,
                body: `❓ **Unknown Command**\n\nThe command \`${commandName}\` is not recognized.\n\nUse \`/help\` to see all available commands.`,
            });
            return;
        }
        const body = `## 📖 Command Help: \`${commandName}\`

**Description:** ${command.description}

**Usage:** \`${command.usage}\`

**Details:** ${command.details}

**Examples:**
${command.examples.map((ex) => `- \`${ex}\``).join('\n')}

---

*Use \`/help\` to see all available commands.*`;
        await context.octokit.rest.issues.createComment({
            owner: context.owner,
            repo: context.repository,
            issue_number: context.prNumber,
            body,
        });
    }
}
exports.HelpCommand = HelpCommand;
//# sourceMappingURL=help-command.js.map