import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;

  async onModuleInit() {
    await this.ensureClient();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = await this.ensureClient();
    const payload = JSON.stringify(value);

    if (ttlSeconds) {
      await client.set(key, payload, { EX: ttlSeconds });
    } else {
      await client.set(key, payload);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.ensureClient();
    const data = await client.get(key);

    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string): Promise<number> {
    const client = await this.ensureClient();
    return client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const client = await this.ensureClient();

    for await (const rawKey of client.scanIterator({ MATCH: pattern })) {
      const key = typeof rawKey === 'string' ? rawKey : rawKey.toString();
      await client.del(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    const client = await this.ensureClient();
    return (await client.exists(key)) === 1;
  }

  private async ensureClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = this.createClient();
      this.client.on('error', (err) =>
        this.logger.error(`Redis client error: ${err.message}`, err.stack),
      );
    }

    if (!this.client.isOpen) {
      await this.client.connect();
    }

    return this.client;
  }

  private createClient(): RedisClientType {
    const username = process.env.REDIS_USERNAME || 'default';
    const password = process.env.REDIS_PASSWORD;
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;

    this.logger.log(`Connecting to Redis at ${host}:${port} (user: ${username})`);

    return createClient({
      username,
      password,
      socket: {
        host,
        port,
      },
    });
  }
}
