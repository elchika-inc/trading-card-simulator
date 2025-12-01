import type { DomainEvent } from "../../domain/events";
import type { EventPublisher, QueueMessage } from "./event-publisher";

/**
 * CloudflareQueuePublisher
 * Cloudflare Queuesを使用したEventPublisherの実装
 */
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

  async publishAll(events: DomainEvent[]): Promise<void> {
    if (!this.queue) {
      console.log("[EventPublisher] Queue not configured, skipping", events.length, "events");
      return;
    }

    if (events.length === 0) {
      return;
    }

    const messages = events.map((event) => ({
      body: this.toQueueMessage(event),
    }));

    await this.queue.sendBatch(messages);
    console.log("[EventPublisher] Published", events.length, "events");
  }

  private toQueueMessage(event: DomainEvent): QueueMessage {
    // DomainEventにtoJSONがあればそれを使う
    const _eventData =
      "toJSON" in event && typeof event.toJSON === "function"
        ? event.toJSON()
        : { type: event.type, occurredAt: event.occurredAt.toISOString() };

    return {
      type: event.type,
      payload: "payload" in event ? event.payload : {},
      occurredAt: event.occurredAt.toISOString(),
      publishedAt: new Date().toISOString(),
    };
  }
}

/**
 * NoOpEventPublisher
 * イベントを発行しないダミー実装（テスト用）
 */
export class NoOpEventPublisher implements EventPublisher {
  private readonly publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
    console.log("[NoOpPublisher] Event captured:", event.type);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.publishedEvents.push(...events);
    console.log("[NoOpPublisher] Events captured:", events.length);
  }

  getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }

  clear(): void {
    this.publishedEvents.length = 0;
  }
}
