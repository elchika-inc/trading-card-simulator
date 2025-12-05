import { ValueObject } from "../shared";

interface PackGroupIdProps {
  value: string;
}

/**
 * PackGroupId Value Object
 * パックグループの識別子
 */
export class PackGroupId extends ValueObject<PackGroupIdProps> {
  private constructor(props: PackGroupIdProps) {
    super(props);
  }

  static create(value: string): PackGroupId {
    if (!value || value.trim() === "") {
      throw new Error("PackGroupId cannot be empty");
    }
    return new PackGroupId({ value: value.trim() });
  }

  getValue(): string {
    return this.props.value;
  }
}
