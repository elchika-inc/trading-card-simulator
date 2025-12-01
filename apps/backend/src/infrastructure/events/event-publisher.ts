import type { DomainEvent } from "../../domain/events";

/**
 * EventPublisher Interface
 * ドメインイベントを発行するためのインターフェース
 */
export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

/**
 * QueueMessage Type
 * Cloudflare Queuesに送信するメッセージの型
 */
export interface QueueMessage {
  type: string;
  payload: unknown;
  occurredAt: string;
  publishedAt: string;
}
