import { BaseDomainEvent } from "./domain-event";

export interface CardCollectedEventPayload {
  cardId: number;
  cardName: string;
  rarity: string;
  source: "gacha" | "trade" | "event";
  sourceId: string;
  collectedAt: string;
}

/**
 * CardCollectedEvent
 * カードがコレクションに追加された時に発行されるドメインイベント
 */
export class CardCollectedEvent extends BaseDomainEvent {
  static readonly TYPE = "card.collected";

  readonly payload: CardCollectedEventPayload;

  constructor(payload: CardCollectedEventPayload) {
    super();
    this.payload = payload;
  }

  get type(): string {
    return CardCollectedEvent.TYPE;
  }

  toJSON() {
    return {
      type: this.type,
      payload: this.payload,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
