/**
 * Domain Event Interface
 * ドメイン内で発生したビジネス上重要な出来事を表す
 */
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}

/**
 * Domain Event基底クラス
 */
export abstract class BaseDomainEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }

  abstract get type(): string;
}
