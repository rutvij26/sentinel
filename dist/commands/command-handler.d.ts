import { Command, CommandContext } from '../types';
import { Logger } from '../utils/logger';
export declare class CommandHandler {
    private commands;
    private logger;
    constructor(logger: Logger);
    private registerCommands;
    handleCommand(commentBody: string, context: CommandContext): Promise<void>;
    private parseCommand;
    private postUnknownCommandResponse;
    private postErrorResponse;
    getAvailableCommands(): Command[];
    getCommand(name: string): Command | undefined;
}
//# sourceMappingURL=command-handler.d.ts.map