import { Context } from '@actions/github/lib/context';
import { Sentinel } from '../sentinel';
import { Logger } from '../utils/logger';
export declare class EventHandler {
    private sentinel;
    private commandHandler;
    private logger;
    constructor(sentinel: Sentinel, logger: Logger);
    handleEvent(context: Context): Promise<void>;
    private handlePullRequestEvent;
    private handleIssueCommentEvent;
    private handlePullRequestReviewEvent;
    private handleCommentCommand;
    private containsCommand;
    private isUserAllowed;
    private getRepoContext;
}
//# sourceMappingURL=event-handler.d.ts.map