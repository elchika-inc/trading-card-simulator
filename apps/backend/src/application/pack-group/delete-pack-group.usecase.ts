import type { PackGroupId, PackGroupRepository } from "../../domain/gacha";

/**
 * DeletePackGroupUseCase
 * パックグループを削除するユースケース
 * 削除時、そのグループに属するパックのgroup_idはNULLに更新される
 */
export class DeletePackGroupUseCase {
  constructor(private readonly packGroupRepository: PackGroupRepository) {}

  async execute(input: DeletePackGroupInput): Promise<DeletePackGroupOutput> {
    const existingGroup = await this.packGroupRepository.findById(input.groupId);

    if (!existingGroup) {
      return { success: false };
    }

    await this.packGroupRepository.delete(input.groupId);

    return { success: true };
  }
}

export interface DeletePackGroupInput {
  groupId: PackGroupId;
}

export interface DeletePackGroupOutput {
  success: boolean;
}
