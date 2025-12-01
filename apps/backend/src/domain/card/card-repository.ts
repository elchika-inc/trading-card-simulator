import type { Card } from "./card";
import type { CardId } from "./card-id";
import type { Rarity } from "./rarity";

/**
 * CardRepository Interface
 * カードの永続化を抽象化するリポジトリインターフェース
 */
export interface CardRepository {
  /**
   * IDでカードを取得
   */
  findById(id: CardId): Promise<Card | null>;

  /**
   * 複数のIDでカードを取得
   */
  findByIds(ids: CardId[]): Promise<Card[]>;

  /**
   * すべてのカードを取得
   */
  findAll(): Promise<Card[]>;

  /**
   * レアリティでカードを取得
   */
  findByRarity(rarity: Rarity): Promise<Card[]>;

  /**
   * カードを保存（新規作成または更新）
   */
  save(card: Card): Promise<void>;

  /**
   * カードを削除
   */
  delete(id: CardId): Promise<void>;

  /**
   * カードの総数を取得
   */
  count(): Promise<number>;

  /**
   * レアリティ別のカード数を取得
   */
  countByRarity(): Promise<Record<string, number>>;
}
