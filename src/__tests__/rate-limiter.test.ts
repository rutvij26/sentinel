import { RateLimiter } from '../utils/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(10); // 10 requests per minute
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('constructor', () => {
    it('should create a rate limiter with specified requests per minute', () => {
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
    });
  });

  describe('canMakeRequest', () => {
    it('should allow requests when under the limit', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    it('should allow multiple requests up to the limit', () => {
      for (let i = 0; i < 10; i++) {
        expect(rateLimiter.canMakeRequest()).toBe(true);
        rateLimiter.recordRequest();
      }
    });

    it('should block requests when at the limit', () => {
      for (let i = 0; i < 10; i++) {
        rateLimiter.recordRequest();
      }
      expect(rateLimiter.canMakeRequest()).toBe(false);
    });
  });

  describe('recordRequest', () => {
    it('should record a request', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
      rateLimiter.recordRequest();
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    it('should increment the request count', () => {
      expect(rateLimiter.getRemainingRequests()).toBe(10);
      rateLimiter.recordRequest();
      expect(rateLimiter.getRemainingRequests()).toBe(9);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return the correct number of remaining requests', () => {
      expect(rateLimiter.getRemainingRequests()).toBe(10);

      rateLimiter.recordRequest();
      expect(rateLimiter.getRemainingRequests()).toBe(9);

      rateLimiter.recordRequest();
      expect(rateLimiter.getRemainingRequests()).toBe(8);
    });

    it('should not return negative values', () => {
      for (let i = 0; i < 15; i++) {
        rateLimiter.recordRequest();
      }
      expect(rateLimiter.getRemainingRequests()).toBe(0);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when no requests have been made', () => {
      expect(rateLimiter.getTimeUntilReset()).toBe(0);
    });

    it('should return time until reset when requests have been made', () => {
      rateLimiter.recordRequest();
      const timeUntilReset = rateLimiter.getTimeUntilReset();
      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(60000); // 1 minute in ms
    });
  });

  describe('cleanup', () => {
    it('should clean up expired requests', () => {
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      let mockTime = 0;

      Date.now = jest.fn(() => mockTime);

      // Record a request
      rateLimiter.recordRequest();
      expect(rateLimiter.getRemainingRequests()).toBe(9);

      // Simulate time passing (more than 1 minute)
      mockTime = 70000; // 70 seconds later

      // Cleanup should happen automatically on next check
      expect(rateLimiter.canMakeRequest()).toBe(true);
      expect(rateLimiter.getRemainingRequests()).toBe(10);

      // Restore original Date.now
      Date.now = originalNow;
    });
  });
});
