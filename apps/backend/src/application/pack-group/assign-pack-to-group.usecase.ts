import type {
  GachaPackId,
  GachaPackRepository,
  PackGroupId,
  PackGroupRepository,
} from "../../domain/gacha";

/**
 * AssignPackToGroupUseCase
 * パックをグループに割り当てるユースケース
 * groupIdがnullの場合はグループから外す
 */
export class AssignPackToGroupUseCase {
  constructor(
    private readonly gachaPackRepository: GachaPackRepository,
    private readonly packGroupRepository: PackGroupRepository,
  ) {}

  async execute(input: AssignPackToGroupInput): Promise<AssignPackToGroupOutput> {
    // パックの存在確認
    const pack = await this.gachaPackRepository.findById(input.packId);
    if (!pack) {
      return { success: false, error: "Pack not found" };
    }

    // グループが指定されている場合、グループの存在確認
    if (input.groupId) {
      const group = await this.packGroupRepository.findById(input.groupId);
      if (!group) {
        return { success: false, error: "Group not found" };
      }
    }

    // パックのグループを更新
    await this.gachaPackRepository.updatePackGroup(input.packId, input.groupId?.getValue() ?? null);

    return { success: true };
  }
}

export interface AssignPackToGroupInput {
  packId: GachaPackId;
  groupId: PackGroupId | null;
}

export interface AssignPackToGroupOutput {
  success: boolean;
  error?: string;
}
