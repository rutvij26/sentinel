import * as core from '@actions/core';
import { AIProvider, SentinelConfig } from '../types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { Logger } from '../utils/logger';

export class AIProviderFactory {
  static createProvider(config: SentinelConfig, logger: Logger): AIProvider {
    switch (config.provider) {
      case 'openai': {
        const openaiKey = core.getInput('openai-api-key');
        if (!openaiKey) {
          throw new Error('OpenAI API key is required when using OpenAI provider');
        }
        logger.info('Creating OpenAI provider');
        return new OpenAIProvider(openaiKey, config, logger);
      }

      case 'gemini': {
        const geminiKey = core.getInput('gemini-api-key');
        if (!geminiKey) {
          throw new Error('Gemini API key is required when using Gemini provider');
        }
        logger.info('Creating Gemini provider');
        return new GeminiProvider(geminiKey, config, logger);
      }

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}
