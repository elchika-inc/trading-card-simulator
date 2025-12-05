import { v4 as uuidv4 } from "uuid";
import { PackGroup, type PackGroupRepository } from "../../domain/gacha";

/**
 * CreatePackGroupUseCase
 * パックグループを作成するユースケース
 */
export class CreatePackGroupUseCase {
  constructor(private readonly packGroupRepository: PackGroupRepository) {}

  async execute(input: CreatePackGroupInput): Promise<CreatePackGroupOutput> {
    const group = PackGroup.create({
      id: uuidv4(),
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? "📦",
      colorFrom: input.colorFrom ?? "from-purple-500",
      colorTo: input.colorTo ?? "to-purple-700",
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });

    await this.packGroupRepository.save(group);

    return {
      group: group.toPlainObject(),
    };
  }
}

export interface CreatePackGroupInput {
  name: string;
  description?: string | null;
  icon?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreatePackGroupOutput {
  group: ReturnType<PackGroup["toPlainObject"]>;
}
