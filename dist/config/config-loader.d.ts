import { SentinelConfig } from '../types';
export declare class ConfigLoader {
    private readonly defaultConfig;
    loadConfig(): Promise<SentinelConfig>;
    private readConfigFile;
    private mergeConfigs;
    validateConfig(config: SentinelConfig): string[];
}
//# sourceMappingURL=config-loader.d.ts.map