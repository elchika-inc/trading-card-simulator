import type {
  GachaPack,
  GachaPackRepository,
  PackGroup,
  PackGroupId,
  PackGroupRepository,
} from "../../domain/gacha";

/**
 * GetPackGroupUseCase
 * パックグループ詳細（パック含む）を取得するユースケース
 */
export class GetPackGroupUseCase {
  constructor(
    private readonly packGroupRepository: PackGroupRepository,
    private readonly gachaPackRepository: GachaPackRepository,
  ) {}

  async execute(input: GetPackGroupInput): Promise<GetPackGroupOutput> {
    const group = await this.packGroupRepository.findById(input.groupId);

    if (!group) {
      return { group: null, packs: [] };
    }

    const packs = await this.gachaPackRepository.findByGroupId(input.groupId.getValue());

    return {
      group: group.toPlainObject(),
      packs: packs.map((pack) => pack.toPlainObject()),
    };
  }
}

export interface GetPackGroupInput {
  groupId: PackGroupId;
}

export interface GetPackGroupOutput {
  group: ReturnType<PackGroup["toPlainObject"]> | null;
  packs: ReturnType<GachaPack["toPlainObject"]>[];
}
