/**
 * Entity基底クラス
 * 同一性（Identity）によって識別されるドメインオブジェクト
 */
export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  /**
   * エンティティの同一性を比較
   * IDが等しければ同一のエンティティとみなす
   */
  equals(other?: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    return this._id === other._id;
  }
}
