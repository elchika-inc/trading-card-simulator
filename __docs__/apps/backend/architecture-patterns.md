# アーキテクチャ設計パターン

Trading Card Simulator バックエンドの設計パターンと実装詳細を説明します。

## 目次

1. [概要](#概要)
2. [DDD (Domain-Driven Design)](#ddd-domain-driven-design)
3. [イベント駆動アーキテクチャ](#イベント駆動アーキテクチャ)
4. [レイヤー構造](#レイヤー構造)
5. [実装パターン](#実装パターン)
6. [依存関係の方向](#依存関係の方向)

---

## 概要

このプロジェクトのバックエンド（`apps/backend`）は、以下の設計原則に基づいています：

- **DDD (Domain-Driven Design)**: ドメイン駆動設計の戦術的パターンを採用
- **イベント駆動アーキテクチャ**: ドメインイベントによる疎結合な設計
- **クリーンアーキテクチャ**: 依存関係逆転の原則（DIP）に基づく層構造
- **SOLID原則**: 特に単一責任の原則（SRP）と依存関係逆転の原則（DIP）

---

## DDD (Domain-Driven Design)

### レイヤー構造

```
apps/backend/src/
├── domain/              # ドメイン層（ビジネスロジック）
│   ├── shared/          # 共通基底クラス
│   ├── card/            # カード集約
│   ├── gacha/           # ガチャ集約
│   └── events/          # ドメインイベント
├── application/         # アプリケーション層（ユースケース）
│   ├── card/            # カード関連ユースケース
│   └── gacha/           # ガチャ関連ユースケース
├── infrastructure/      # インフラ層（技術的実装）
│   ├── persistence/     # 永続化（Repository実装）
│   ├── events/          # イベント発行・処理
│   └── di/              # DIコンテナ
└── presentation/        # プレゼンテーション層（API）
    └── routes/          # HTTPルーティング
```

### Building Blocks（構成要素）

#### 1. Entity（エンティティ）

**定義**: 同一性（Identity）によって識別されるドメインオブジェクト

**実装**: `apps/backend/src/domain/shared/entity.ts`

```typescript
export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  /**
   * エンティティの同一性を比較
   * IDが等しければ同一のエンティティとみなす
   */
  equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id === other._id;
  }
}
```

**使用例**: `Card`エンティティ（`apps/backend/src/domain/card/card.ts`）

#### 2. Value Object（値オブジェクト）

**定義**: 属性によって識別されるイミュータブルなドメインオブジェクト

**実装**: `apps/backend/src/domain/shared/value-object.ts`

```typescript
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props); // イミュータブル
  }

  /**
   * 値オブジェクトの等価性を比較
   * すべての属性が等しければ等価とみなす
   */
  equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

**使用例**:
- `CardId`, `Rarity`, `HoloType`, `TextStyle`
- `GachaPackId`, `Weight`, `GachaRate`

#### 3. Aggregate Root（集約ルート）

**定義**: 集約の境界を定義し、ドメインイベントを管理するエンティティ

**実装**: `apps/backend/src/domain/shared/aggregate-root.ts`

```typescript
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  /**
   * ドメインイベントを追加
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * ドメインイベントをクリア
   * イベントを発行した後に呼び出す
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
```

**使用例**: `Card`, `GachaPack`, `GachaLog`

**パターン**:
- `create()`: 新規作成時にドメインイベントを発行
- `reconstruct()`: DB取得時はイベント発行なし

```typescript
// Card Entity（apps/backend/src/domain/card/card.ts）
export class Card extends AggregateRoot<CardId> {
  /**
   * 新しいカードを作成（ファクトリメソッド）
   */
  static create(props: CardProps): Card {
    const card = new Card(...);

    // ドメインイベントを発行
    card.addDomainEvent(new CardCreatedEvent(props.id));

    return card;
  }

  /**
   * 既存のカードを再構築（Repository用）
   * ドメインイベントは発行しない
   */
  static reconstruct(props: CardProps): Card {
    return new Card(...);
  }
}
```

#### 4. Repository（リポジトリ）

**定義**: 集約の永続化・取得を抽象化するインターフェース

**パターン**: インターフェースはドメイン層、実装はインフラ層（依存関係逆転）

**インターフェース**: `apps/backend/src/domain/card/card-repository.ts`

```typescript
export interface CardRepository {
  findById(id: CardId): Promise<Card | null>;
  findByIds(ids: CardId[]): Promise<Card[]>;
  findAll(): Promise<Card[]>;
  findByRarity(rarity: Rarity): Promise<Card[]>;
  save(card: Card): Promise<void>;
}
```

**実装**: `apps/backend/src/infrastructure/persistence/d1/card-repository-d1.ts`

```typescript
export class D1CardRepository implements CardRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: CardId): Promise<Card | null> {
    const row = await this.db
      .prepare("SELECT * FROM cards WHERE id = ?")
      .bind(id.getValue())
      .first();

    if (!row) return null;
    return CardMapper.toDomain(row);
  }
  // ... 他のメソッド実装
}
```

#### 5. Domain Service（ドメインサービス）

**定義**: 複数の集約にまたがるビジネスロジックを扱うサービス

**使用例**: `GachaService`（`apps/backend/src/domain/gacha/gacha-service.ts`）

```typescript
export class GachaService {
  /**
   * ガチャを実行してカードを抽選
   * @param pack ガチャパック
   * @returns 抽選されたカードIDの配列とガチャログ
   */
  draw(pack: GachaPack): { cardIds: CardId[]; log: GachaLog } {
    if (!pack.getIsActive()) {
      throw new Error("This gacha pack is not active");
    }

    const rates = pack.getRates();
    const totalWeight = pack.getTotalWeight();
    const cardsPerPack = pack.getCardsPerPack();
    const drawnCardIds: CardId[] = [];

    for (let i = 0; i < cardsPerPack; i++) {
      const cardId = this.drawOne(rates, totalWeight);
      drawnCardIds.push(cardId);
    }

    const log = GachaLog.create(pack.getId(), drawnCardIds);

    return { cardIds: drawnCardIds, log };
  }

  private drawOne(...): CardId {
    // 加重ランダム抽選ロジック
  }
}
```

**特徴**:
- ステートレス（状態を持たない）
- ドメインロジックのみを扱う
- 技術的な実装詳細は持たない

---

## イベント駆動アーキテクチャ

### Domain Events（ドメインイベント）

**定義**: ドメイン内で発生したビジネス上重要な出来事

**基底インターフェース**: `apps/backend/src/domain/events/domain-event.ts`

```typescript
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}

export abstract class BaseDomainEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }

  abstract get type(): string;
}
```

**具体的なイベント例**:

```typescript
// CardCreatedEvent（apps/backend/src/domain/events/card-created.ts）
export class CardCreatedEvent extends BaseDomainEvent {
  constructor(public readonly cardId: number) {
    super();
  }

  get type(): string {
    return "card.created";
  }
}

// GachaDrawnEvent（apps/backend/src/domain/events/gacha-drawn.event.ts）
export class GachaDrawnEvent extends BaseDomainEvent {
  constructor(
    public readonly payload: {
      logId: string;
      packId: string;
      cardIds: number[];
      drawnAt: string;
    }
  ) {
    super();
  }

  get type(): string {
    return "gacha.drawn";
  }
}
```

### Event Publishing（イベント発行）

**インターフェース**: `apps/backend/src/infrastructure/events/event-publisher.ts`

```typescript
export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}
```

**実装**: Cloudflare Queues使用（`apps/backend/src/infrastructure/events/cloudflare-queue-publisher.ts`）

```typescript
export class CloudflareQueuePublisher implements EventPublisher {
  constructor(private readonly queue: Queue | null) {}

  async publish(event: DomainEvent): Promise<void> {
    if (!this.queue) {
      console.log("[EventPublisher] Queue not configured, skipping:", event.type);
      return;
    }

    const message = this.toQueueMessage(event);
    await this.queue.send(message);
    console.log("[EventPublisher] Published event:", event.type);
  }

  private toQueueMessage(event: DomainEvent): QueueMessage {
    return {
      type: event.type,
      payload: "payload" in event ? event.payload : {},
      occurredAt: event.occurredAt.toISOString(),
      publishedAt: new Date().toISOString(),
    };
  }
}
```

### Event Processing（イベント処理）

**Queue Consumer**: `apps/backend/src/infrastructure/events/queue-consumer.ts`

Cloudflare Workers Queue Handlerでイベントを非同期処理。

**エントリーポイント**: `apps/backend/src/index.ts`

```typescript
const queueConsumer = new QueueConsumer();

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<QueueMessage>, env: Env, ctx: ExecutionContext): Promise<void> {
    await queueConsumer.processBatch(batch);
  },
};
```

### イベント駆動のフロー

```
1. Aggregate Rootがドメインイベントを生成
   ↓
2. Use CaseがEventPublisherでイベント発行
   ↓
3. Cloudflare Queuesに非同期送信
   ↓
4. Queue Consumer（別Worker）で非同期処理
   ↓
5. Event Handlerで具体的な処理（通知、分析、など）
```

**例**: ガチャ実行時のイベントフロー

```typescript
// Use Case（apps/backend/src/application/gacha/draw-gacha.usecase.ts）
export class DrawGachaUseCase {
  async execute(input: DrawGachaInput): Promise<DrawGachaOutput> {
    // 1. ガチャを実行（Domain Service）
    const { cardIds, log } = this.gachaService.draw(pack);

    // 2. ログを保存
    await this.gachaLogRepository.save(log);

    // 3. ドメインイベントを発行
    const event = new GachaDrawnEvent({
      logId: log.getId().getValue(),
      packId: pack.getId().getValue(),
      cardIds: cardIds.map((id) => id.getValue()),
      drawnAt: log.getExecutedAt().toISOString(),
    });
    await this.eventPublisher.publish(event);

    return { /* ... */ };
  }
}
```

---

## レイヤー構造

### 1. Domain Layer（ドメイン層）

**責務**: ビジネスロジックとビジネスルールの実装

**ディレクトリ**: `apps/backend/src/domain/`

**含まれるもの**:
- Entity, Value Object, Aggregate Root
- Repository Interface（実装はInfrastructure層）
- Domain Service
- Domain Event

**依存関係**: 他の層に依存しない（Pure Business Logic）

### 2. Application Layer（アプリケーション層）

**責務**: ユースケースの実装、トランザクション管理、イベント発行

**ディレクトリ**: `apps/backend/src/application/`

**含まれるもの**:
- Use Case（ビジネスプロセスの調整）
- Input/Output DTO

**依存関係**: Domain層に依存、Infrastructure層のインターフェースを使用

**例**: `DrawGachaUseCase`

```typescript
export class DrawGachaUseCase {
  constructor(
    private readonly gachaPackRepository: GachaPackRepository, // Interface
    private readonly gachaLogRepository: GachaLogRepository,   // Interface
    private readonly cardRepository: CardRepository,           // Interface
    private readonly gachaService: GachaService,               // Domain Service
    private readonly eventPublisher: EventPublisher,           // Interface
  ) {}

  async execute(input: DrawGachaInput): Promise<DrawGachaOutput> {
    // ユースケースの実装
  }
}
```

### 3. Infrastructure Layer（インフラ層）

**責務**: 技術的な実装詳細（DB、外部API、イベント発行など）

**ディレクトリ**: `apps/backend/src/infrastructure/`

**含まれるもの**:
- Repository実装（D1 Database）
- Event Publisher実装（Cloudflare Queues）
- DI Container
- Mapper（Domain ↔ Persistence変換）

**依存関係**: Domain層、Application層に依存

**例**: Repository実装とMapper

```typescript
// Repository実装
export class D1CardRepository implements CardRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: CardId): Promise<Card | null> {
    const row = await this.db.prepare("...").bind(id.getValue()).first();
    if (!row) return null;
    return CardMapper.toDomain(row); // Mapperでドメインモデルに変換
  }
}

// Mapper（apps/backend/src/infrastructure/persistence/mappers/card-mapper.ts）
export class CardMapper {
  static toDomain(row: CardRow): Card {
    return Card.reconstruct({
      id: row.id,
      name: row.name,
      // ... 他のプロパティ
    });
  }

  static toPersistence(card: Card): CardRow {
    return {
      id: card.getId().getValue(),
      name: card.getName(),
      // ... 他のプロパティ
    };
  }
}
```

### 4. Presentation Layer（プレゼンテーション層）

**責務**: HTTPリクエスト/レスポンス、バリデーション

**ディレクトリ**: `apps/backend/src/presentation/`

**含まれるもの**:
- Routes（Honoルーティング）
- Request/Response変換

**依存関係**: Application層に依存

**例**: カードAPI（`apps/backend/src/presentation/routes/cards.ts`）

```typescript
const cardsRoutes = new Hono<{ Bindings: Env }>();

cardsRoutes.get("/", async (c) => {
  const container = createContainer(c.env);
  const useCase = new GetAllCardsUseCase(container.getCardRepository());

  const result = await useCase.execute();

  return c.json({
    cards: result.cards,
    total: result.total,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 実装パターン

### 1. Dependency Injection（DI）

**DIコンテナ**: `apps/backend/src/infrastructure/di/container.ts`

```typescript
export class Container {
  private readonly env: Env;
  private cardRepository: CardRepository | null = null;
  private gachaService: GachaService | null = null;
  private eventPublisher: EventPublisher | null = null;

  constructor(env: Env) {
    this.env = env;
  }

  getCardRepository(): CardRepository {
    if (!this.cardRepository) {
      this.cardRepository = new D1CardRepository(this.ensureDB());
    }
    return this.cardRepository;
  }

  getGachaService(): GachaService {
    if (!this.gachaService) {
      this.gachaService = new GachaService();
    }
    return this.gachaService;
  }

  getEventPublisher(): EventPublisher {
    if (!this.eventPublisher) {
      this.eventPublisher = new CloudflareQueuePublisher(this.env.EVENTS_QUEUE ?? null);
    }
    return this.eventPublisher;
  }
}
```

**特徴**:
- リクエストごとにコンテナを生成（軽量、ステートレス）
- Lazy Initialization（遅延初期化）
- Cloudflare Workers環境に最適化

### 2. Factory Pattern

**ファクトリメソッド**: `create()` と `reconstruct()` の分離

```typescript
export class Card extends AggregateRoot<CardId> {
  // 新規作成: ドメインイベント発行
  static create(props: CardProps): Card {
    const card = new Card(...);
    card.addDomainEvent(new CardCreatedEvent(props.id));
    return card;
  }

  // 再構築: イベント発行なし（DB取得時）
  static reconstruct(props: CardProps): Card {
    return new Card(...);
  }
}
```

**使い分け**:
- `create()`: 新規作成時、ビジネスロジック実行、ドメインイベント発行
- `reconstruct()`: DBから取得時、イベント発行不要

### 3. Mapper Pattern

**責務**: ドメインモデル ↔ 永続化モデルの変換

**実装**: `apps/backend/src/infrastructure/persistence/mappers/`

```typescript
export class CardMapper {
  // DB Row → Domain Model
  static toDomain(row: CardRow): Card {
    return Card.reconstruct({ /* ... */ });
  }

  // Domain Model → DB Row
  static toPersistence(card: Card): CardRow {
    return { /* ... */ };
  }
}
```

**利点**:
- ドメインモデルを永続化の詳細から分離
- DBスキーマ変更の影響をMapperに局所化

---

## 依存関係の方向

### 依存関係逆転の原則（DIP）

```
┌─────────────────────────────────────┐
│  Presentation Layer (Routes)        │
│  └─ Hono HTTP Handlers             │
└─────────────────────────────────────┘
               ↓ depends on
┌─────────────────────────────────────┐
│  Application Layer (Use Cases)      │
│  └─ Business Process Orchestration  │
└─────────────────────────────────────┘
         ↓                    ↑
    depends on          implements
         ↓                    ↑
┌─────────────────────────────────────┐
│  Domain Layer (Core Business)       │
│  ├─ Entities, Value Objects         │
│  ├─ Aggregate Roots                 │
│  ├─ Repository Interfaces ←─────────┼─ Implemented by
│  ├─ Domain Services                 │   Infrastructure
│  └─ Domain Events                   │
└─────────────────────────────────────┘
         ↑                    ↓
   implements           depends on
         ↑                    ↓
┌─────────────────────────────────────┐
│  Infrastructure Layer               │
│  ├─ Repository Implementations      │
│  ├─ Event Publishers                │
│  ├─ DI Container                    │
│  └─ Mappers                         │
└─────────────────────────────────────┘
```

**重要なポイント**:
- **Domain層は他の層に依存しない**（Pure Business Logic）
- **Infrastructure層がDomain層のインターフェースを実装**（DIP）
- **Application層はInterfaceに依存、実装には依存しない**

### レイヤー間の呼び出し例

```typescript
// Presentation → Application → Domain → Infrastructure

// 1. Presentation Layer（Route）
app.post("/api/gacha/:packId/draw", async (c) => {
  const container = createContainer(c.env);

  // 2. Use Caseを取得（DI）
  const useCase = new DrawGachaUseCase(
    container.getGachaPackRepository(),  // Infrastructure実装
    container.getGachaLogRepository(),   // Infrastructure実装
    container.getCardRepository(),       // Infrastructure実装
    container.getGachaService(),         // Domain Service
    container.getEventPublisher(),       // Infrastructure実装
  );

  // 3. Use Case実行
  const result = await useCase.execute({ packId: c.req.param("packId") });

  return c.json(result);
});

// DrawGachaUseCase（Application Layer）
async execute(input: DrawGachaInput): Promise<DrawGachaOutput> {
  // 4. Repository Interface経由でDomain取得
  const pack = await this.gachaPackRepository.findById(packId);

  // 5. Domain Serviceでビジネスロジック実行
  const { cardIds, log } = this.gachaService.draw(pack);

  // 6. Repository Interface経由で永続化
  await this.gachaLogRepository.save(log);

  // 7. Event Publisher Interface経由でイベント発行
  await this.eventPublisher.publish(new GachaDrawnEvent(...));

  return { /* ... */ };
}
```

---

## まとめ

### 設計パターンの利点

1. **ビジネスロジックの分離**: ドメイン層が技術詳細から独立
2. **テスタビリティ**: インターフェースによるモック・スタブが容易
3. **保守性**: 層ごとに責務が明確、変更の影響範囲が限定的
4. **拡張性**: 新しい機能追加時、既存コードへの影響が最小限
5. **可読性**: ビジネスロジックがドメインモデルとして明示的

### 技術スタック

- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite-compatible)
- **Queue**: Cloudflare Queues
- **Framework**: Hono
- **Language**: TypeScript（strict mode）

### 参考リンク

- [Domain-Driven Design Reference](https://www.domainlanguage.com/ddd/reference/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Queues Documentation](https://developers.cloudflare.com/queues/)
