import { Entity } from "../shared";
import { NewsId } from "./news-id";

export interface NewsProps {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string;
  packIds: string[];
  bannerAssetId: string | null;
  isActive: boolean;
  sortOrder: number;
  cardIds: number[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * News Entity (Aggregate Root)
 * ランディングページのカルーセル用Newsエントリ
 * カード（複数）、パック（複数）、バナー画像（1つ）を紐づけ可能
 */
export class News extends Entity<NewsId> {
  private readonly title: string;
  private readonly subtitle: string | null;
  private readonly badgeText: string;
  private readonly packIds: string[];
  private readonly bannerAssetId: string | null;
  private readonly isActive: boolean;
  private readonly sortOrder: number;
  private readonly cardIds: number[];
  private readonly createdAt: string;
  private readonly updatedAt: string;

  private constructor(props: NewsProps) {
    super(NewsId.create(props.id));
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.badgeText = props.badgeText;
    this.packIds = props.packIds;
    this.bannerAssetId = props.bannerAssetId;
    this.isActive = props.isActive;
    this.sortOrder = props.sortOrder;
    this.cardIds = props.cardIds;
    this.createdAt = props.createdAt ?? new Date().toISOString();
    this.updatedAt = props.updatedAt ?? new Date().toISOString();
  }

  static create(props: Omit<NewsProps, "createdAt" | "updatedAt">): News {
    if (!props.title || props.title.trim() === "") {
      throw new Error("News title cannot be empty");
    }
    return new News({
      ...props,
      badgeText: props.badgeText || "NEW",
    });
  }

  static reconstruct(props: NewsProps): News {
    return new News(props);
  }

  getId(): NewsId {
    return this._id;
  }

  getTitle(): string {
    return this.title;
  }

  getSubtitle(): string | null {
    return this.subtitle;
  }

  getBadgeText(): string {
    return this.badgeText;
  }

  getPackIds(): string[] {
    return [...this.packIds];
  }

  getBannerAssetId(): string | null {
    return this.bannerAssetId;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getCardIds(): number[] {
    return [...this.cardIds];
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  getUpdatedAt(): string {
    return this.updatedAt;
  }

  toPlainObject() {
    return {
      id: this._id.getValue(),
      title: this.title,
      subtitle: this.subtitle,
      badgeText: this.badgeText,
      packIds: this.packIds,
      bannerAssetId: this.bannerAssetId,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      cardIds: this.cardIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
