import nodeCache from 'node-cache';

export class CacheService{

    private cache: nodeCache;
    
    constructor(){
        this.cache = new nodeCache();
    }

    add(key: string, payload: any, ttl: number){ 
        return this.cache.set(key, payload, ttl);
    }
    
    get(key: string){
        return this.cache.get(key);
    }
    
    del(key: string){
        return this.cache.del(key);
    }
    
    flush(){
        return this.cache.flushAll();
    }
    
    close(){
        return this.cache.close();
    }

}

export function createCacheService(){
    return new CacheService();
}