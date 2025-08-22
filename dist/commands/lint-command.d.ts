import { Command, CommandContext } from '../types';
export declare class LintCommand implements Command {
    name: string;
    description: string;
    usage: string;
    execute(context: CommandContext): Promise<void>;
    private buildLintComment;
}
//# sourceMappingURL=lint-command.d.ts.map