import { GachaDrawnEvent } from "../../domain/events";
import type { QueueMessage } from "./event-publisher";

/**
 * EventHandler Interface
 * 特定のイベントを処理するハンドラーのインターフェース
 */
export interface EventHandler {
  canHandle(eventType: string): boolean;
  handle(message: QueueMessage): Promise<void>;
}

/**
 * GachaDrawnEventHandler
 * ガチャ抽選イベントを処理するハンドラー
 */
export class GachaDrawnEventHandler implements EventHandler {
  canHandle(eventType: string): boolean {
    return eventType === GachaDrawnEvent.TYPE;
  }

  async handle(message: QueueMessage): Promise<void> {
    const payload = message.payload as {
      logId: string;
      packId: string;
      cardIds: number[];
      drawnAt: string;
    };

    console.log("[GachaDrawnEventHandler] Processing gacha result:", {
      logId: payload.logId,
      packId: payload.packId,
      cardCount: payload.cardIds.length,
    });

    // ここで追加の処理を行う
    // - 統計情報の更新
    // - 通知の送信
    // - 外部サービスへの連携
    // など

    // 将来の拡張ポイント:
    // await this.statsService.recordGachaDraw(payload);
    // await this.notificationService.notifyRareCard(payload);
  }
}

/**
 * LoggingEventHandler
 * すべてのイベントをログに記録するハンドラー
 */
export class LoggingEventHandler implements EventHandler {
  canHandle(_eventType: string): boolean {
    return true; // すべてのイベントを処理
  }

  async handle(message: QueueMessage): Promise<void> {
    console.log("[LoggingEventHandler] Event received:", {
      type: message.type,
      occurredAt: message.occurredAt,
      publishedAt: message.publishedAt,
      payload: message.payload,
    });
  }
}
