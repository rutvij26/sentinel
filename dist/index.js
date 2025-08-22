"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const sentinel_1 = require("./sentinel");
const config_loader_1 = require("./config/config-loader");
const event_handler_1 = require("./events/event-handler");
const logger_1 = require("./utils/logger");
async function run() {
    try {
        const logger = new logger_1.Logger();
        logger.info('🚀 Sentinel Action starting...');
        // Load configuration
        const configLoader = new config_loader_1.ConfigLoader();
        const config = await configLoader.loadConfig();
        logger.info('✅ Configuration loaded successfully');
        // Initialize GitHub client
        const token = core.getInput('github-token', { required: true });
        const octokit = github.getOctokit(token);
        logger.info('✅ GitHub client initialized');
        // Initialize Sentinel
        const sentinel = new sentinel_1.Sentinel(config, octokit, logger);
        logger.info('✅ Sentinel initialized');
        // Handle the event
        const eventHandler = new event_handler_1.EventHandler(sentinel, logger);
        await eventHandler.handleEvent(github.context);
        logger.info('✅ Event handled successfully');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        core.setFailed(`Sentinel Action failed: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
            core.error(error.stack);
        }
    }
}
run();
//# sourceMappingURL=index.js.map