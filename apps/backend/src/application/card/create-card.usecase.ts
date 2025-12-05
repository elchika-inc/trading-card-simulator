import type { FrameColor } from "@repo/types";
import { Card, CardId, type CardRepository } from "../../domain/card";
import type { GachaPackRepository } from "../../domain/gacha";
import type { EventPublisher } from "../../infrastructure/events/event-publisher";

/**
 * パック割当情報（入力用）
 */
export interface PackAssignmentInput {
  packId: string;
  weight: number;
  isPickup?: boolean;
}

/**
 * CreateCardUseCase Input DTO
 */
export interface CreateCardInput {
  name: string;
  holoType: string;
  textStyle: string;
  imageId: string;
  description?: string;
  iconName?: string;
  rarity: string;
  frameColor?: FrameColor;
  packAssignments?: PackAssignmentInput[];
}

/**
 * CreateCardUseCase Output DTO
 */
export interface CreateCardOutput {
  card: ReturnType<Card["toPlainObject"]>;
}

/**
 * CreateCardUseCase
 * カードを新規作成するユースケース
 */
export class CreateCardUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly gachaPackRepository: GachaPackRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: CreateCardInput): Promise<CreateCardOutput> {
    // 1. 新しいIDを生成（既存カード数 + 1）
    const count = await this.cardRepository.count();
    const newId = count + 1;

    // 2. Card.create()でカードエンティティを作成（ドメインイベント発行）
    // assetIdには画像IDを設定（URLはフロントエンド側で構築）
    const card = Card.create({
      id: newId,
      name: input.name,
      type: `Style: ${input.textStyle}, Anim: ${input.holoType}`,
      holoType: input.holoType,
      textStyle: input.textStyle,
      assetId: input.imageId,
      description: input.description || "",
      iconName: input.iconName || "Star",
      rarity: input.rarity,
      frameColor: input.frameColor,
    });

    // 3. 永続化
    await this.cardRepository.save(card);

    // 4. パック割当を処理（指定された場合）
    if (input.packAssignments && input.packAssignments.length > 0) {
      const rates = input.packAssignments.map((assignment) => ({
        packId: assignment.packId,
        weight: assignment.weight,
        isPickup: assignment.isPickup ?? false,
      }));
      await this.gachaPackRepository.updateCardRates(CardId.create(newId), rates);
    }

    // 5. ドメインイベントを発行
    const events = card.domainEvents;
    if (events.length > 0) {
      await this.eventPublisher.publishAll([...events]);
      card.clearDomainEvents();
    }

    // 6. Output DTOに変換して返す
    return {
      card: card.toPlainObject(),
    };
  }
}
