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
}

const redis = new Redis();
export default redis;
