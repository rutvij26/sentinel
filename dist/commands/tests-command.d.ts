import { Command, CommandContext } from '../types';
export declare class TestsCommand implements Command {
    name: string;
    description: string;
    usage: string;
    execute(context: CommandContext): Promise<void>;
    private buildTestSuggestionsComment;
}
//# sourceMappingURL=tests-command.d.ts.map