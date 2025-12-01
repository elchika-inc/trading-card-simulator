import type { Card, CardRepository } from "../../domain/card";
import { GachaDrawnEvent } from "../../domain/events";
import {
  type GachaLogRepository,
  GachaPackId,
  type GachaPackRepository,
  type GachaService,
} from "../../domain/gacha";
import type { EventPublisher } from "../../infrastructure/events";

/**
 * DrawGachaUseCase
 * ガチャを引くユースケース
 */
export class DrawGachaUseCase {
  constructor(
    private readonly gachaPackRepository: GachaPackRepository,
    private readonly gachaLogRepository: GachaLogRepository,
    private readonly cardRepository: CardRepository,
    private readonly gachaService: GachaService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: DrawGachaInput): Promise<DrawGachaOutput> {
    // パックを取得
    const packId = GachaPackId.create(input.packId);
    const pack = await this.gachaPackRepository.findById(packId);

    if (!pack) {
      throw new Error("Gacha pack not found");
    }

    if (!pack.getIsActive()) {
      throw new Error("This gacha pack is not active");
    }

    // ガチャを実行
    const { cardIds, log } = this.gachaService.draw(pack);

    // ログを保存
    await this.gachaLogRepository.save(log);

    // カード情報を取得
    const cards = await this.cardRepository.findByIds(cardIds);

    // カードIDの順序を維持（同じカードが複数出る可能性があるため）
    const orderedCards = cardIds.map((cardId) => {
      const card = cards.find((c) => c.getId().equals(cardId));
      if (!card) {
        throw new Error(`Card not found: ${cardId.getValue()}`);
      }
      return card;
    });

    // ドメインイベントを発行
    const event = new GachaDrawnEvent({
      logId: log.getId().getValue(),
      packId: pack.getId().getValue(),
      cardIds: cardIds.map((id) => id.getValue()),
      drawnAt: log.getExecutedAt().toISOString(),
    });
    await this.eventPublisher.publish(event);

    return {
      logId: log.getId().getValue(),
      packId: pack.getId().getValue(),
      cards: orderedCards.map((card) => card.toPlainObject()),
    };
  }
}

export interface DrawGachaInput {
  packId: string;
}

export interface DrawGachaOutput {
  logId: string;
  packId: string;
  cards: ReturnType<Card["toPlainObject"]>[];
}
