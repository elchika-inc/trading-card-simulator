import type { FrameColor } from "@repo/types";
import { Card, CardId, type CardRepository } from "../../domain/card";
import type { GachaPackRepository } from "../../domain/gacha";

/**
 * パック割当情報（入力用）
 */
export interface PackAssignmentInput {
  packId: string;
  weight: number;
  isPickup?: boolean;
}

/**
 * UpdateCardUseCase Input DTO
 */
export interface UpdateCardInput {
  id: number;
  name?: string;
  holoType?: string;
  textStyle?: string;
  assetId?: string;
  description?: string;
  iconName?: string;
  rarity?: string;
  frameColor?: FrameColor;
  packAssignments?: PackAssignmentInput[];
}

/**
 * UpdateCardUseCase Output DTO
 */
export interface UpdateCardOutput {
  card: ReturnType<Card["toPlainObject"]>;
}

/**
 * UpdateCardUseCase
 * 既存カードを更新するユースケース
 */
export class UpdateCardUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly gachaPackRepository: GachaPackRepository,
  ) {}

  async execute(input: UpdateCardInput): Promise<UpdateCardOutput> {
    // 1. 既存のカードを取得
    const existingCard = await this.cardRepository.findById(CardId.create(input.id));

    if (!existingCard) {
      throw new Error(`Card with id ${input.id} not found`);
    }

    // 2. 既存の値とマージして新しいカードを作成
    const existingPlain = existingCard.toPlainObject();

    // frameColorは明示的にundefinedが渡された場合のみ既存値を使用
    // （nullish coalescing ?? ではなく、引数の有無で判断）
    const frameColor = input.frameColor !== undefined ? input.frameColor : existingPlain.frameColor;

    const updatedCard = Card.reconstruct({
      id: input.id,
      name: input.name ?? existingPlain.name,
      type: `Style: ${input.textStyle ?? existingPlain.textStyle}, Anim: ${input.holoType ?? existingPlain.holoType}`,
      holoType: input.holoType ?? existingPlain.holoType,
      textStyle: input.textStyle ?? existingPlain.textStyle,
      assetId: input.assetId ?? existingPlain.image,
      description: input.description ?? existingPlain.description,
      iconName: input.iconName ?? existingPlain.iconName,
      rarity: input.rarity ?? existingPlain.rarity,
      frameColor,
    });

    // 3. 永続化
    await this.cardRepository.save(updatedCard);

    // 4. パック割当を処理（指定された場合のみ）
    if (input.packAssignments !== undefined) {
      const rates = input.packAssignments.map((assignment) => ({
        packId: assignment.packId,
        weight: assignment.weight,
        isPickup: assignment.isPickup ?? false,
      }));
      await this.gachaPackRepository.updateCardRates(CardId.create(input.id), rates);
    }

    // 5. Output DTOに変換して返す
    return {
      card: updatedCard.toPlainObject(),
    };
  }
}
