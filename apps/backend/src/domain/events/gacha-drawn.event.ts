import { BaseDomainEvent } from "./domain-event";

export interface GachaDrawnEventPayload {
  logId: string;
  packId: string;
  cardIds: number[];
  drawnAt: string;
}

/**
 * GachaDrawnEvent
 * ガチャが引かれた時に発行されるドメインイベント
 */
export class GachaDrawnEvent extends BaseDomainEvent {
  static readonly TYPE = "gacha.drawn";

  readonly payload: GachaDrawnEventPayload;

  constructor(payload: GachaDrawnEventPayload) {
    super();
    this.payload = payload;
  }

  get type(): string {
    return GachaDrawnEvent.TYPE;
  }

  toJSON() {
    return {
      type: this.type,
      payload: this.payload,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
