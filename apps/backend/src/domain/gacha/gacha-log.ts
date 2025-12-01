import type { CardId } from "../card";
import { AggregateRoot } from "../shared";
import { GachaLogId } from "./gacha-log-id";
import type { GachaPackId } from "./gacha-pack-id";

export interface GachaLogProps {
  id: string;
  packId: GachaPackId;
  cardIds: CardId[];
  executedAt: Date;
}

/**
 * GachaLog Entity
 * ガチャ実行ログ
 */
export class GachaLog extends AggregateRoot<GachaLogId> {
  private readonly packId: GachaPackId;
  private readonly cardIds: CardId[];
  private readonly executedAt: Date;

  private constructor(props: GachaLogProps) {
    super(GachaLogId.create(props.id));
    this.packId = props.packId;
    this.cardIds = props.cardIds;
    this.executedAt = props.executedAt;
  }

  static create(packId: GachaPackId, cardIds: CardId[]): GachaLog {
    return new GachaLog({
      id: crypto.randomUUID(),
      packId,
      cardIds,
      executedAt: new Date(),
    });
  }

  static reconstruct(props: GachaLogProps): GachaLog {
    return new GachaLog(props);
  }

  getId(): GachaLogId {
    return this._id;
  }

  getPackId(): GachaPackId {
    return this.packId;
  }

  getCardIds(): CardId[] {
    return [...this.cardIds];
  }

  getExecutedAt(): Date {
    return this.executedAt;
  }

  toPlainObject() {
    return {
      id: this._id.getValue(),
      packId: this.packId.getValue(),
      cardIds: this.cardIds.map((id) => id.getValue()),
      executedAt: this.executedAt.toISOString(),
    };
  }
}
