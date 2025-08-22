import { Command, CommandContext } from '../types';
export declare class HelpCommand implements Command {
    name: string;
    description: string;
    usage: string;
    execute(context: CommandContext): Promise<void>;
    private parseArgs;
    private showGeneralHelp;
    private showCommandHelp;
}
//# sourceMappingURL=help-command.d.ts.map