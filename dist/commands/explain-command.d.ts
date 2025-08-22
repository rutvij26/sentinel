import { Command, CommandContext } from '../types';
export declare class ExplainCommand implements Command {
    name: string;
    description: string;
    usage: string;
    execute(context: CommandContext): Promise<void>;
    private parseArgs;
    private postUsageHelp;
}
//# sourceMappingURL=explain-command.d.ts.map