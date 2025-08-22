"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    requests = [];
    maxRequests;
    windowMs;
    constructor(requestsPerMinute) {
        this.maxRequests = requestsPerMinute;
        this.windowMs = 60 * 1000; // 1 minute
    }
    canMakeRequest() {
        this.cleanup();
        return this.requests.length < this.maxRequests;
    }
    recordRequest() {
        this.requests.push(Date.now());
    }
    async waitForNextWindow() {
        if (this.requests.length === 0)
            return;
        const oldestRequest = Math.min(...this.requests);
        const timeToWait = this.windowMs - (Date.now() - oldestRequest);
        if (timeToWait > 0) {
            await new Promise((resolve) => setTimeout(resolve, timeToWait));
        }
        this.cleanup();
    }
    cleanup() {
        const now = Date.now();
        this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    }
    getRemainingRequests() {
        this.cleanup();
        return Math.max(0, this.maxRequests - this.requests.length);
    }
    getTimeUntilReset() {
        if (this.requests.length === 0)
            return 0;
        const oldestRequest = Math.min(...this.requests);
        const timeElapsed = Date.now() - oldestRequest;
        return Math.max(0, this.windowMs - timeElapsed);
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rate-limiter.js.map