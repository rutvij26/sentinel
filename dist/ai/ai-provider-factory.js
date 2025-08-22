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
exports.AIProviderFactory = void 0;
const core = __importStar(require("@actions/core"));
const openai_provider_1 = require("./openai-provider");
const gemini_provider_1 = require("./gemini-provider");
class AIProviderFactory {
    static createProvider(config, logger) {
        switch (config.provider) {
            case 'openai': {
                const openaiKey = core.getInput('openai-api-key');
                if (!openaiKey) {
                    throw new Error('OpenAI API key is required when using OpenAI provider');
                }
                logger.info('Creating OpenAI provider');
                return new openai_provider_1.OpenAIProvider(openaiKey, config, logger);
            }
            case 'gemini': {
                const geminiKey = core.getInput('gemini-api-key');
                if (!geminiKey) {
                    throw new Error('Gemini API key is required when using Gemini provider');
                }
                logger.info('Creating Gemini provider');
                return new gemini_provider_1.GeminiProvider(geminiKey, config, logger);
            }
            default:
                throw new Error(`Unsupported AI provider: ${config.provider}`);
        }
    }
}
exports.AIProviderFactory = AIProviderFactory;
//# sourceMappingURL=ai-provider-factory.js.map