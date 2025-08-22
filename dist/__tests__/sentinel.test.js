"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sentinel_1 = require("../sentinel");
// Mock dependencies
jest.mock('../ai/ai-provider-factory');
jest.mock('../github/pr-diff-fetcher');
jest.mock('../github/pr-commenter');
jest.mock('../utils/cache');
describe('Sentinel', () => {
    let sentinel;
    let mockConfig;
    let mockOctokit;
    let mockLogger;
    beforeEach(() => {
        mockConfig = {
            provider: 'openai',
            model: 'gpt-4',
            maxTokens: 4000,
            reviewDepth: 'normal',
            rateLimit: {
                requestsPerMinute: 60,
                maxRetries: 3,
            },
            commands: {
                enabled: true,
                allowedUsers: [],
            },
            review: {
                autoReview: true,
                commentOnFiles: true,
                suggestTests: true,
                suggestLinting: true,
            },
        };
        mockOctokit = {
            rest: {
                pulls: {
                    get: jest.fn(),
                },
                issues: {
                    createComment: jest.fn(),
                },
            },
        };
        mockLogger = {
            info: jest.fn(),
            warning: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            notice: jest.fn(),
            group: jest.fn(),
            endGroup: jest.fn(),
        };
        // Reset environment variables
        delete process.env.GITHUB_REPOSITORY_OWNER;
        delete process.env.GITHUB_REPOSITORY;
    });
    describe('constructor', () => {
        it('should create a Sentinel instance with valid config', () => {
            expect(() => {
                sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            }).not.toThrow();
        });
        it('should initialize all required components', () => {
            sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            expect(sentinel.getConfig()).toBe(mockConfig);
            expect(sentinel.getLogger()).toBe(mockLogger);
        });
    });
    describe('getConfig', () => {
        it('should return the configuration', () => {
            sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            expect(sentinel.getConfig()).toBe(mockConfig);
        });
    });
    describe('getLogger', () => {
        it('should return the logger', () => {
            sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            expect(sentinel.getLogger()).toBe(mockLogger);
        });
    });
    describe('getRepoContext', () => {
        it('should return default values when environment variables are not set', async () => {
            sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            // Access private method for testing
            const result = await sentinel.getRepoContext();
            expect(result.owner).toBe('unknown');
            expect(result.repo).toBe('unknown');
        });
        it('should return environment variable values when set', async () => {
            process.env.GITHUB_REPOSITORY_OWNER = 'test-owner';
            process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';
            sentinel = new sentinel_1.Sentinel(mockConfig, mockOctokit, mockLogger);
            // Access private method for testing
            const result = await sentinel.getRepoContext();
            expect(result.owner).toBe('test-owner');
            expect(result.repo).toBe('test-repo');
        });
    });
});
//# sourceMappingURL=sentinel.test.js.map