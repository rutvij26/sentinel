import { Command, CommandContext } from '../types';
export declare class SummarizeCommand implements Command {
    name: string;
    description: string;
    usage: string;
    execute(context: CommandContext): Promise<void>;
}
//# sourceMappingURL=summarize-command.d.ts.map