import { Entity } from "../shared";
import { PackGroupId } from "./pack-group-id";

export interface PackGroupProps {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  colorFrom: string;
  colorTo: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

/**
 * PackGroup Entity
 * パックグループ（シリーズ/期間別のグループ）
 */
export class PackGroup extends Entity<PackGroupId> {
  private readonly name: string;
  private readonly description: string | null;
  private readonly icon: string;
  private readonly colorFrom: string;
  private readonly colorTo: string;
  private readonly isActive: boolean;
  private readonly sortOrder: number;
  private readonly createdAt: string;

  private constructor(props: PackGroupProps) {
    super(PackGroupId.create(props.id));
    this.name = props.name;
    this.description = props.description;
    this.icon = props.icon;
    this.colorFrom = props.colorFrom;
    this.colorTo = props.colorTo;
    this.isActive = props.isActive;
    this.sortOrder = props.sortOrder;
    this.createdAt = props.createdAt ?? new Date().toISOString();
  }

  static create(props: Omit<PackGroupProps, "createdAt">): PackGroup {
    if (!props.name || props.name.trim() === "") {
      throw new Error("PackGroup name cannot be empty");
    }
    return new PackGroup({
      ...props,
      icon: props.icon || "📦",
      colorFrom: props.colorFrom || "from-purple-500",
      colorTo: props.colorTo || "to-purple-700",
    });
  }

  static reconstruct(props: PackGroupProps): PackGroup {
    return new PackGroup(props);
  }

  getId(): PackGroupId {
    return this._id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIcon(): string {
    return this.icon;
  }

  getColorFrom(): string {
    return this.colorFrom;
  }

  getColorTo(): string {
    return this.colorTo;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  toPlainObject() {
    return {
      id: this._id.getValue(),
      name: this.name,
      description: this.description,
      icon: this.icon,
      colorFrom: this.colorFrom,
      colorTo: this.colorTo,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
    };
  }
}
