import type { CardRepository } from "@/domain/card/card-repository";
import type { EventPublisher } from "@/infrastructure/events/event-publisher";

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
  imageWorkerUrl: string; // 環境変数から渡される
}

/**
 * CreateCardUseCase Output DTO
 */
export interface CreateCardOutput {
  card: {
    id: number;
    count: number;
    name: string;
    type: string;
    holoType: string;
    textStyle: string;
    image: string;
    description: string;
    iconName: string;
    rarity: string;
  };
}

/**
 * CreateCardUseCase
 * カードを新規作成するユースケース
 */
export class CreateCardUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: CreateCardInput): Promise<CreateCardOutput> {
    // 1. 新しいIDを生成（既存カード数 + 1）
    const count = await this.cardRepository.count();
    const newId = count + 1;

    // 2. 画像URLを構築
    const imageUrl = `${input.imageWorkerUrl}/serve/${input.imageId}`;

    // 3. Card.create()でカードエンティティを作成（ドメインイベント発行）
    const card = Card.create({
      id: newId,
      name: input.name,
      type: `Style: ${input.textStyle}, Anim: ${input.holoType}`,
      holoType: input.holoType,
      textStyle: input.textStyle,
      imageUrl,
      description: input.description || "",
      iconName: input.iconName || "Star",
      rarity: input.rarity,
    });

    // 4. 永続化
    await this.cardRepository.save(card);

    // 5. ドメインイベントを発行
    const events = card.domainEvents;
    if (events.length > 0) {
      await this.eventPublisher.publishAll(events);
      card.clearDomainEvents();
    }

    // 6. Output DTOに変換して返す
    const plainObject = card.toPlainObject();
    return {
      card: {
        id: plainObject.id,
        count: plainObject.count,
        name: plainObject.name,
        type: plainObject.type,
        holoType: plainObject.holoType,
        textStyle: plainObject.textStyle,
        image: plainObject.image,
        description: plainObject.description,
        iconName: plainObject.iconName,
        rarity: plainObject.rarity,
      },
    };
  }
}
