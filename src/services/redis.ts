import env from "@/env";
import { Redis as UpstashRedis, SetCommandOptions } from "@upstash/redis";

class Redis {
  private readonly client: UpstashRedis;

  constructor() {
    this.client = new UpstashRedis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    });
  }

  public async set<TData>(
    key: string,
    data: TData,
    options?: SetCommandOptions,
  ): Promise<"OK" | TData | null> {
    try {
      const res = await this.client.set(key, data, options);
      await this.client.sadd(key.split("?")[0], key);
      return res;
    } catch (err) {
      console.log("Cache request limit reached...");
      return null;
    }
  }

  public async get<TData>(key: string): Promise<TData | null> {
    try {
      const res = await this.client.get(key);
      return res as TData | null;
    } catch (err) {
      console.log("Cache request limit reached...");
      return null;
    }
  }

  public async del(key: string, opts?: { exclude: string }): Promise<void> {
    try {
      const isGroupKey = !key.includes("?");

      if (isGroupKey) {
        console.log(`Deleting all keys for group: ${key}`);

        const groupKeys = await this.client.smembers(key);

        const keysToDelete = opts?.exclude
          ? groupKeys.filter((groupKey) => !groupKey.includes(opts.exclude))
          : groupKeys;

        if (keysToDelete.length > 0) {
          await Promise.all(
            keysToDelete.map((filteredKey) => this.client.del(filteredKey)),
          );
          console.log(`Deleted ${keysToDelete.length} keys for group: ${key}`);
        }

        await this.client.del(key);
      } else {
        console.log(`Deleting individual key: ${key}`);
        await this.client.del(key);
      }
    } catch (err) {
      console.log(`Error during cache invalidation: ${err}`);
    }
  }
}

const redis = new Redis();
export default redis;
