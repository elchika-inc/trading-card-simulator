import type { Card, CardId, CardRepository, Rarity } from "../../../domain/card";
import { CardMapper, type CardRow } from "../mappers/card-mapper";

/**
 * D1CardRepository
 * Cloudflare D1を使用したCardRepositoryの実装
 */
export class D1CardRepository implements CardRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: CardId): Promise<Card | null> {
    const result = await this.db
      .prepare("SELECT * FROM cards WHERE id = ?")
      .bind(id.getValue())
      .first<CardRow>();

    return result ? CardMapper.toDomain(result) : null;
  }

  async findByIds(ids: CardId[]): Promise<Card[]> {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => "?").join(",");
    const results = await this.db
      .prepare(`SELECT * FROM cards WHERE id IN (${placeholders})`)
      .bind(...ids.map((id) => id.getValue()))
      .all<CardRow>();

    return results.results.map((row) => CardMapper.toDomain(row));
  }

  async findAll(): Promise<Card[]> {
    const results = await this.db.prepare("SELECT * FROM cards ORDER BY id").all<CardRow>();

    return results.results.map((row) => CardMapper.toDomain(row));
  }

  async findByRarity(rarity: Rarity): Promise<Card[]> {
    const results = await this.db
      .prepare("SELECT * FROM cards WHERE rarity = ? ORDER BY id")
      .bind(rarity.getValue())
      .all<CardRow>();

    return results.results.map((row) => CardMapper.toDomain(row));
  }

  async save(card: Card): Promise<void> {
    const row = CardMapper.toPersistence(card);

    await this.db
      .prepare(
        `
        INSERT OR REPLACE INTO cards
        (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity, frame_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        row.id,
        row.name,
        row.type,
        row.holo_type,
        row.text_style,
        row.asset_id,
        row.description,
        row.icon_name,
        row.rarity,
        row.frame_color,
      )
      .run();
  }

  async delete(id: CardId): Promise<void> {
    await this.db.prepare("DELETE FROM cards WHERE id = ?").bind(id.getValue()).run();
  }

  async count(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM cards")
      .first<{ count: number }>();

    return result?.count ?? 0;
  }

  async countByRarity(): Promise<Record<string, number>> {
    const results = await this.db
      .prepare("SELECT rarity, COUNT(*) as count FROM cards GROUP BY rarity ORDER BY rarity")
      .all<{ rarity: string; count: number }>();

    return results.results.reduce(
      (acc, row) => {
        acc[row.rarity] = row.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
