export declare class Cache {
    private cache;
    get<T>(key: string): T | null;
    set<T>(key: string, value: T, ttl?: number): void;
    delete(key: string): void;
    clear(): void;
    has(key: string): boolean;
    size(): number;
    keys(): string[];
    cleanup(): void;
}
//# sourceMappingURL=cache.d.ts.map