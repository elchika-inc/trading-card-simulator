import type { EventHandler } from "./event-handler";
import { GachaDrawnEventHandler, LoggingEventHandler } from "./event-handler";
import type { QueueMessage } from "./event-publisher";

/**
 * QueueConsumer
 * Cloudflare Queuesからメッセージを受信して処理するコンシューマー
 */
export class QueueConsumer {
  private readonly handlers: EventHandler[];

  constructor(handlers?: EventHandler[]) {
    // デフォルトのハンドラーを設定
    this.handlers = handlers || [new LoggingEventHandler(), new GachaDrawnEventHandler()];
  }

  /**
   * メッセージバッチを処理
   */
  async processBatch(batch: MessageBatch<QueueMessage>): Promise<void> {
    console.log(`[QueueConsumer] Processing batch of ${batch.messages.length} messages`);

    for (const message of batch.messages) {
      try {
        await this.processMessage(message.body);
        message.ack();
      } catch (error) {
        console.error("[QueueConsumer] Error processing message:", error);
        message.retry();
      }
    }
  }

  /**
   * 単一のメッセージを処理
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    const applicableHandlers = this.handlers.filter((h) => h.canHandle(message.type));

    if (applicableHandlers.length === 0) {
      console.warn(`[QueueConsumer] No handler for event type: ${message.type}`);
      return;
    }

    for (const handler of applicableHandlers) {
      await handler.handle(message);
    }
  }
}

/**
 * createQueueHandler
 * Cloudflare Workers queue handlerを作成するファクトリ関数
 */
export function createQueueHandler() {
  const consumer = new QueueConsumer();

  return async (
    batch: MessageBatch<QueueMessage>,
    _env: unknown,
    _ctx: ExecutionContext,
  ): Promise<void> => {
    await consumer.processBatch(batch);
  };
}
