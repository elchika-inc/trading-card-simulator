import type { DomainEvent } from "../events/domain-event";
import { Entity } from "./entity";

/**
 * Aggregate Root基底クラス
 * 集約の境界を定義し、ドメインイベントを管理する
 */
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
