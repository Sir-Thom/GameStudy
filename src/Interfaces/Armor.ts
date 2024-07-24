export interface Armor {
  id: number;
  name: string;
  picture: string;
  defense_stat: number;
  special_ability?: number;
  description?: string;
  strength_scaling?: number;
  dexterity_scaling?: number;
  intelligence_scaling?: number;
  constitution_scaling?: number;
  luck_scaling?: number;
}
