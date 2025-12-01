import type { Env } from "@repo/types/env";
import type { CardRepository } from "../../domain/card";
import type { GachaLogRepository, GachaPackRepository } from "../../domain/gacha";
import { GachaService } from "../../domain/gacha";
import type { EventPublisher } from "../events";
import { CloudflareQueuePublisher } from "../events";
import { D1CardRepository } from "../persistence/d1/card-repository-d1";
import { D1GachaLogRepository } from "../persistence/d1/gacha-log-repository-d1";
import { D1GachaPackRepository } from "../persistence/d1/gacha-pack-repository-d1";

/**
 * DIコンテナ
 * Cloudflare Workersのリクエストごとに生成される軽量コンテナ
 */
export class Container {
  private readonly env: Env;
  private cardRepository: CardRepository | null = null;
  private gachaPackRepository: GachaPackRepository | null = null;
  private gachaLogRepository: GachaLogRepository | null = null;
  private gachaService: GachaService | null = null;
  private eventPublisher: EventPublisher | null = null;

  constructor(env: Env) {
    this.env = env;
  }

  private ensureDB(): D1Database {
    if (!this.env.DB) {
      throw new Error("D1 Database is not configured");
    }
    return this.env.DB;
  }

  /**
   * CardRepositoryを取得
   */
  getCardRepository(): CardRepository {
    if (!this.cardRepository) {
      this.cardRepository = new D1CardRepository(this.ensureDB());
    }
    return this.cardRepository;
  }

  /**
   * GachaPackRepositoryを取得
   */
  getGachaPackRepository(): GachaPackRepository {
    if (!this.gachaPackRepository) {
      this.gachaPackRepository = new D1GachaPackRepository(this.ensureDB());
    }
    return this.gachaPackRepository;
  }

  /**
   * GachaLogRepositoryを取得
   */
  getGachaLogRepository(): GachaLogRepository {
    if (!this.gachaLogRepository) {
      this.gachaLogRepository = new D1GachaLogRepository(this.ensureDB());
    }
    return this.gachaLogRepository;
  }

  /**
   * GachaServiceを取得
   */
  getGachaService(): GachaService {
    if (!this.gachaService) {
      this.gachaService = new GachaService();
    }
    return this.gachaService;
  }

  /**
   * EventPublisherを取得
   * Queueが設定されていない場合でも動作する（ログ出力のみ）
   */
  getEventPublisher(): EventPublisher {
    if (!this.eventPublisher) {
      this.eventPublisher = new CloudflareQueuePublisher(this.env.EVENTS_QUEUE ?? null);
    }
    return this.eventPublisher;
  }

  /**
   * 環境変数を取得
   */
  getEnv(): Env {
    return this.env;
  }
}

/**
 * リクエストごとにコンテナを生成するファクトリ関数
 */
export function createContainer(env: Env): Container {
  return new Container(env);
}
