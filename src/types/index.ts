export interface SentinelConfig {
  provider: 'openai' | 'gemini';
  model: string;
  maxTokens: number;
  reviewDepth: 'light' | 'normal' | 'deep';
  rateLimit: {
    requestsPerMinute: number;
    maxRetries: number;
  };
  commands: {
    enabled: boolean;
    allowedUsers?: string[];
  };
  review: {
    autoReview: boolean;
    commentOnFiles: boolean;
    suggestTests: boolean;
    suggestLinting: boolean;
  };
}

export interface PRDiff {
  files: ChangedFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
}

export interface ChangedFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  content?: string;
}

export interface ReviewResult {
  summary: string;
  comments: ReviewComment[];
  suggestions: string[];
  tests?: TestSuggestion[];
  lintIssues?: LintIssue[];
}

export interface ReviewComment {
  path: string;
  line: number;
  body: string;
  type: 'suggestion' | 'question' | 'bug' | 'praise';
}

export interface TestSuggestion {
  file: string;
  testCases: string[];
  description: string;
}

export interface LintIssue {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
}

export interface AIProvider {
  reviewCode(_diff: PRDiff): Promise<ReviewResult>;
  summarizePR(_diff: PRDiff): Promise<string>;
  explainFile(_file: ChangedFile): Promise<string>;
  suggestTests(_diff: PRDiff): Promise<TestSuggestion[]>;
  lintCode(_diff: PRDiff): Promise<LintIssue[]>;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute(_context: CommandContext): Promise<void>;
}

export interface CommandContext {
  prNumber: number;
  repository: string;
  owner: string;
  commentBody: string;
  commentAuthor: string;
  octokit: any;
  sentinel: any;
}

export interface RateLimiter {
  canMakeRequest(): boolean;
  recordRequest(): void;
  waitForNextWindow(): Promise<void>;
}

export interface Cache {
  get<T>(_key: string): T | null;
  set<T>(_key: string, _value: T, _ttl?: number): void;
  delete(_key: string): void;
  clear(): void;
}
