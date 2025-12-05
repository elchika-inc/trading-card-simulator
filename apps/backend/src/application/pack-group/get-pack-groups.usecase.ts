import type { PackGroup, PackGroupRepository } from "../../domain/gacha";

/**
 * GetPackGroupsUseCase
 * アクティブなパックグループ一覧を取得するユースケース
 */
export class GetPackGroupsUseCase {
  constructor(private readonly packGroupRepository: PackGroupRepository) {}

  async execute(input?: GetPackGroupsInput): Promise<GetPackGroupsOutput> {
    const groups = input?.includeInactive
      ? await this.packGroupRepository.findAll()
      : await this.packGroupRepository.findActive();

    return {
      groups: groups.map((group) => group.toPlainObject()),
    };
  }
}

export interface GetPackGroupsInput {
  includeInactive?: boolean;
}

export interface GetPackGroupsOutput {
  groups: ReturnType<PackGroup["toPlainObject"]>[];
}
