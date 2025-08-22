export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(requestsPerMinute: number) {
    this.maxRequests = requestsPerMinute;
    this.windowMs = 60 * 1000; // 1 minute
  }

  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  async waitForNextWindow(): Promise<void> {
    if (this.requests.length === 0) return;

    const oldestRequest = Math.min(...this.requests);
    const timeToWait = this.windowMs - (Date.now() - oldestRequest);

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
  }

  getRemainingRequests(): number {
    this.cleanup();
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;

    const oldestRequest = Math.min(...this.requests);
    const timeElapsed = Date.now() - oldestRequest;
    return Math.max(0, this.windowMs - timeElapsed);
  }
}
