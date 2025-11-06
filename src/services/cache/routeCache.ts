import cachify from "@nasriya/cachify";

const routeCache = cachify.createClient();

// On TTL expiration, remove the file content from the cache to save space
routeCache.files.configs.ttl.policy = 'keep';

export default routeCache;