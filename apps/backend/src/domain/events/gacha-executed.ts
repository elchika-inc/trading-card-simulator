import { BaseDomainEvent } from "./domain-event";

/**
 * ガチャ実行イベント
 */
export class GachaExecutedEvent extends BaseDomainEvent {
  readonly type = "GACHA_EXECUTED" as const;

  constructor(
    readonly packId: string,
    readonly cardIds: number[],
  ) {
    super();
  }
}
