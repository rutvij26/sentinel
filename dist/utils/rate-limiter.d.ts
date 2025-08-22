export declare class RateLimiter {
    private requests;
    private readonly maxRequests;
    private readonly windowMs;
    constructor(requestsPerMinute: number);
    canMakeRequest(): boolean;
    recordRequest(): void;
    waitForNextWindow(): Promise<void>;
    private cleanup;
    getRemainingRequests(): number;
    getTimeUntilReset(): number;
}
//# sourceMappingURL=rate-limiter.d.ts.map