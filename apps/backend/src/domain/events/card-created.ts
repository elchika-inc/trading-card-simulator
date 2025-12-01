import { BaseDomainEvent } from "./domain-event";

/**
 * カード作成イベント
 */
export class CardCreatedEvent extends BaseDomainEvent {
  readonly type = "CARD_CREATED" as const;

  constructor(readonly cardId: number) {
    super();
  }
}
