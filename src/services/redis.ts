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

  public async del(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        // Check if the key contains a wildcard
        if (key.includes("*")) {
          console.log(`Deleting all keys matching pattern: ${key}`);

          let cursor = "0";
          do {
            const [nextCursor, matchedKeys] = await this.client.scan(cursor, {
              match: key,
              count: 100,
            });
            cursor = nextCursor;

            if (matchedKeys.length > 0) {
              await Promise.all(
                matchedKeys.map((matchedKey) => this.client.del(matchedKey)),
              );
              console.log(
                `Deleted ${matchedKeys.length} keys matching pattern: ${key}`,
              );
            }
          } while (cursor !== "0");
        } else {
          // Handle exact key deletion
          console.log(`Deleting exact key: ${key}`);
          await this.client.del(key);
        }
      }
    } catch (err) {
      console.error(`Error during cache invalidation: ${err}`);
    }
  }
}

const redis = new Redis();
export default redis;
