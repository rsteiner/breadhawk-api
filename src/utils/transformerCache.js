class TransformerCache {
    constructor(ttl = 5 * 60 * 1000) { // 5 minute default TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    // Generate cache key from data
    generateKey(type, id) {
        return `${type}_${id}`;
    }

    // Get or set cached transformation
    transform(type, data, transformer) {
        if (!data) return null;
        
        const key = this.generateKey(type, data[`${type}ID`]);
        
        if (!this.cache.has(key)) {
            this.cache.set(key, {
                data: transformer(data),
                timestamp: Date.now()
            });
        }

        const cached = this.cache.get(key);
        
        // Check if cached data is still valid
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return this.transform(type, data, transformer);
        }

        return cached.data;
    }

    // Clear expired cache entries
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Create singleton instance
const transformerCache = new TransformerCache();

// Run cleanup every minute
setInterval(() => transformerCache.cleanup(), 60 * 1000);

module.exports = transformerCache;