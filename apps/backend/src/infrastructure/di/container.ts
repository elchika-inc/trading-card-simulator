import type { Env } from "@repo/types/env";
import { CreateCardUseCase, UpdateCardUseCase } from "../../application/card";
import {
  CreateNewsUseCase,
  DeleteNewsUseCase,
  GetNewsListUseCase,
  GetNewsUseCase,
  UpdateNewsUseCase,
} from "../../application/news";
import {
  AssignPackToGroupUseCase,
  CreatePackGroupUseCase,
  DeletePackGroupUseCase,
  GetPackGroupsUseCase,
  GetPackGroupUseCase,
  UpdatePackGroupUseCase,
} from "../../application/pack-group";
import type { AssetRepository } from "../../domain/asset";
import type { CardRepository } from "../../domain/card";
import type {
  GachaLogRepository,
  GachaPackRepository,
  PackGroupRepository,
} from "../../domain/gacha";
import { GachaService } from "../../domain/gacha";
import type { NewsRepository } from "../../domain/news";
import type { SiteSettingsRepository } from "../../domain/settings";
import type { EventPublisher } from "../events";
import { CloudflareQueuePublisher } from "../events";
import { D1AssetRepository } from "../persistence/d1/asset-repository-d1";
import { D1CardRepository } from "../persistence/d1/card-repository-d1";
import { D1GachaLogRepository } from "../persistence/d1/gacha-log-repository-d1";
import { D1GachaPackRepository } from "../persistence/d1/gacha-pack-repository-d1";
import { D1NewsRepository } from "../persistence/d1/news-repository-d1";
import { D1PackGroupRepository } from "../persistence/d1/pack-group-repository-d1";
import { SiteSettingsRepositoryD1 } from "../persistence/d1/site-settings-repository-d1";

/**
 * DIコンテナ
 * Cloudflare Workersのリクエストごとに生成される軽量コンテナ
 */
export class Container {
  private readonly env: Env;
  private assetRepository: AssetRepository | null = null;
  private cardRepository: CardRepository | null = null;
  private gachaPackRepository: GachaPackRepository | null = null;
  private gachaLogRepository: GachaLogRepository | null = null;
  private packGroupRepository: PackGroupRepository | null = null;
  private newsRepository: NewsRepository | null = null;
  private gachaService: GachaService | null = null;
  private eventPublisher: EventPublisher | null = null;
  private siteSettingsRepository: SiteSettingsRepository | null = null;

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
   * AssetRepositoryを取得
   */
  getAssetRepository(): AssetRepository {
    if (!this.assetRepository) {
      this.assetRepository = new D1AssetRepository(this.ensureDB());
    }
    return this.assetRepository;
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
   * PackGroupRepositoryを取得
   */
  getPackGroupRepository(): PackGroupRepository {
    if (!this.packGroupRepository) {
      this.packGroupRepository = new D1PackGroupRepository(this.ensureDB());
    }
    return this.packGroupRepository;
  }

  /**
   * NewsRepositoryを取得
   */
  getNewsRepository(): NewsRepository {
    if (!this.newsRepository) {
      this.newsRepository = new D1NewsRepository(this.ensureDB());
    }
    return this.newsRepository;
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

  /**
   * CreateCardUseCaseを取得
   */
  getCreateCardUseCase(): CreateCardUseCase {
    return new CreateCardUseCase(
      this.getCardRepository(),
      this.getGachaPackRepository(),
      this.getEventPublisher(),
    );
  }

  /**
   * UpdateCardUseCaseを取得
   */
  getUpdateCardUseCase(): UpdateCardUseCase {
    return new UpdateCardUseCase(this.getCardRepository(), this.getGachaPackRepository());
  }

  /**
   * SiteSettingsRepositoryを取得
   */
  getSiteSettingsRepository(): SiteSettingsRepository {
    if (!this.siteSettingsRepository) {
      this.siteSettingsRepository = new SiteSettingsRepositoryD1(this.ensureDB());
    }
    return this.siteSettingsRepository;
  }

  // ========== Pack Group UseCases ==========

  /**
   * GetPackGroupsUseCaseを取得
   */
  getGetPackGroupsUseCase(): GetPackGroupsUseCase {
    return new GetPackGroupsUseCase(this.getPackGroupRepository());
  }

  /**
   * GetPackGroupUseCaseを取得
   */
  getGetPackGroupUseCase(): GetPackGroupUseCase {
    return new GetPackGroupUseCase(this.getPackGroupRepository(), this.getGachaPackRepository());
  }

  /**
   * CreatePackGroupUseCaseを取得
   */
  getCreatePackGroupUseCase(): CreatePackGroupUseCase {
    return new CreatePackGroupUseCase(this.getPackGroupRepository());
  }

  /**
   * UpdatePackGroupUseCaseを取得
   */
  getUpdatePackGroupUseCase(): UpdatePackGroupUseCase {
    return new UpdatePackGroupUseCase(this.getPackGroupRepository());
  }

  /**
   * DeletePackGroupUseCaseを取得
   */
  getDeletePackGroupUseCase(): DeletePackGroupUseCase {
    return new DeletePackGroupUseCase(this.getPackGroupRepository());
  }

  /**
   * AssignPackToGroupUseCaseを取得
   */
  getAssignPackToGroupUseCase(): AssignPackToGroupUseCase {
    return new AssignPackToGroupUseCase(
      this.getGachaPackRepository(),
      this.getPackGroupRepository(),
    );
  }

  // ========== News UseCases ==========

  /**
   * GetNewsListUseCaseを取得
   */
  getGetNewsListUseCase(): GetNewsListUseCase {
    return new GetNewsListUseCase(this.getNewsRepository());
  }

  /**
   * GetNewsUseCaseを取得
   */
  getGetNewsUseCase(): GetNewsUseCase {
    return new GetNewsUseCase(
      this.getNewsRepository(),
      this.getCardRepository(),
      this.getGachaPackRepository(),
    );
  }

  /**
   * CreateNewsUseCaseを取得
   */
  getCreateNewsUseCase(): CreateNewsUseCase {
    return new CreateNewsUseCase(this.getNewsRepository());
  }

  /**
   * UpdateNewsUseCaseを取得
   */
  getUpdateNewsUseCase(): UpdateNewsUseCase {
    return new UpdateNewsUseCase(this.getNewsRepository());
  }

  /**
   * DeleteNewsUseCaseを取得
   */
  getDeleteNewsUseCase(): DeleteNewsUseCase {
    return new DeleteNewsUseCase(this.getNewsRepository());
  }
}

/**
 * リクエストごとにコンテナを生成するファクトリ関数
 */
export function createContainer(env: Env): Container {
  return new Container(env);
}
