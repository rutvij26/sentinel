import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { SentinelConfig } from '../types';

export class ConfigLoader {
  private readonly defaultConfig: SentinelConfig = {
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

  async loadConfig(): Promise<SentinelConfig> {
    try {
      const configPath = core.getInput('config-file') || '.sentinel.yml';
      const configContent = await this.readConfigFile(configPath);

      if (configContent) {
        const userConfig = yaml.parse(configContent);
        return this.mergeConfigs(this.defaultConfig, userConfig);
      }

      return this.defaultConfig;
    } catch (error) {
      core.warning(
        `Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      core.info('Using default configuration');
      return this.defaultConfig;
    }
  }

  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      // Try to read from the repository root
      const fullPath = path.resolve(process.cwd(), configPath);

      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private mergeConfigs(defaultConfig: SentinelConfig, userConfig: any): SentinelConfig {
    const merged = { ...defaultConfig };

    if (userConfig.provider && ['openai', 'gemini'].includes(userConfig.provider)) {
      merged.provider = userConfig.provider;
    }

    if (userConfig.model && typeof userConfig.model === 'string') {
      merged.model = userConfig.model;
    }

    if (userConfig.maxTokens && typeof userConfig.maxTokens === 'number') {
      merged.maxTokens = Math.max(1000, Math.min(8000, userConfig.maxTokens));
    }

    if (userConfig.reviewDepth && ['light', 'normal', 'deep'].includes(userConfig.reviewDepth)) {
      merged.reviewDepth = userConfig.reviewDepth;
    }

    if (userConfig.rateLimit) {
      if (userConfig.rateLimit.requestsPerMinute) {
        merged.rateLimit.requestsPerMinute = Math.max(10, userConfig.rateLimit.requestsPerMinute);
      }
      if (userConfig.rateLimit.maxRetries) {
        merged.rateLimit.maxRetries = Math.max(1, Math.min(10, userConfig.rateLimit.maxRetries));
      }
    }

    if (userConfig.commands) {
      if (typeof userConfig.commands.enabled === 'boolean') {
        merged.commands.enabled = userConfig.commands.enabled;
      }
      if (Array.isArray(userConfig.commands.allowedUsers)) {
        merged.commands.allowedUsers = userConfig.commands.allowedUsers;
      }
    }

    if (userConfig.review) {
      if (typeof userConfig.review.autoReview === 'boolean') {
        merged.review.autoReview = userConfig.review.autoReview;
      }
      if (typeof userConfig.review.commentOnFiles === 'boolean') {
        merged.review.commentOnFiles = userConfig.review.commentOnFiles;
      }
      if (typeof userConfig.review.suggestTests === 'boolean') {
        merged.review.suggestTests = userConfig.review.suggestTests;
      }
      if (typeof userConfig.review.suggestLinting === 'boolean') {
        merged.review.suggestLinting = userConfig.review.suggestLinting;
      }
    }

    return merged;
  }

  validateConfig(config: SentinelConfig): string[] {
    const errors: string[] = [];

    if (!['openai', 'gemini'].includes(config.provider)) {
      errors.push('Invalid provider. Must be "openai" or "gemini"');
    }

    if (!config.model || config.model.trim() === '') {
      errors.push('Model name is required');
    }

    if (config.maxTokens < 1000 || config.maxTokens > 8000) {
      errors.push('Max tokens must be between 1000 and 8000');
    }

    if (!['light', 'normal', 'deep'].includes(config.reviewDepth)) {
      errors.push('Review depth must be "light", "normal", or "deep"');
    }

    if (config.rateLimit.requestsPerMinute < 10) {
      errors.push('Rate limit must be at least 10 requests per minute');
    }

    if (config.rateLimit.maxRetries < 1 || config.rateLimit.maxRetries > 10) {
      errors.push('Max retries must be between 1 and 10');
    }

    return errors;
  }
}
