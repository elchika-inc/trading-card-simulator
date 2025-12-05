import { ValueObject } from "../shared";

interface NewsIdProps {
  value: string;
}

/**
 * NewsId Value Object
 * Newsの識別子
 */
export class NewsId extends ValueObject<NewsIdProps> {
  private constructor(props: NewsIdProps) {
    super(props);
  }

  static create(value: string): NewsId {
    if (!value || value.trim() === "") {
      throw new Error("NewsId cannot be empty");
    }
    return new NewsId({ value: value.trim() });
  }

  getValue(): string {
    return this.props.value;
  }
}
