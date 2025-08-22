import * as core from '@actions/core';
import * as github from '@actions/github';
import { Sentinel } from './sentinel';
import { ConfigLoader } from './config/config-loader';
import { EventHandler } from './events/event-handler';
import { Logger } from './utils/logger';

async function run(): Promise<void> {
  try {
    const logger = new Logger();
    logger.info('🚀 Sentinel Action starting...');

    // Load configuration
    const configLoader = new ConfigLoader();
    const config = await configLoader.loadConfig();
    logger.info('✅ Configuration loaded successfully');

    // Initialize GitHub client
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);
    logger.info('✅ GitHub client initialized');

    // Initialize Sentinel
    const sentinel = new Sentinel(config, octokit, logger);
    logger.info('✅ Sentinel initialized');

    // Handle the event
    const eventHandler = new EventHandler(sentinel, logger);
    await eventHandler.handleEvent(github.context);
    logger.info('✅ Event handled successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.setFailed(`Sentinel Action failed: ${errorMessage}`);

    if (error instanceof Error && error.stack) {
      core.error(error.stack);
    }
  }
}

run();
