import { PackGroup, type PackGroupId, type PackGroupRepository } from "../../domain/gacha";

/**
 * UpdatePackGroupUseCase
 * パックグループを更新するユースケース
 */
export class UpdatePackGroupUseCase {
  constructor(private readonly packGroupRepository: PackGroupRepository) {}

  async execute(input: UpdatePackGroupInput): Promise<UpdatePackGroupOutput> {
    const existingGroup = await this.packGroupRepository.findById(input.groupId);

    if (!existingGroup) {
      return { group: null, success: false };
    }

    const existing = existingGroup.toPlainObject();

    const updatedGroup = PackGroup.reconstruct({
      id: existing.id,
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      icon: input.icon ?? existing.icon,
      colorFrom: input.colorFrom ?? existing.colorFrom,
      colorTo: input.colorTo ?? existing.colorTo,
      isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
      createdAt: existing.createdAt,
    });

    await this.packGroupRepository.update(updatedGroup);

    return {
      group: updatedGroup.toPlainObject(),
      success: true,
    };
  }
}

export interface UpdatePackGroupInput {
  groupId: PackGroupId;
  name?: string;
  description?: string | null;
  icon?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePackGroupOutput {
  group: ReturnType<PackGroup["toPlainObject"]> | null;
  success: boolean;
}
