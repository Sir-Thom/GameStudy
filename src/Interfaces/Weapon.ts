export interface Weapon {
  id: number;
  name: string;
  type: WeaponType;
  damage_type: DamageType;
  base_damage: number;
  defense_provided?: number;
  description?: string;
}
export type WeaponType = 'SwordAndShield' | 'Dagger' | 'Bow' | 'GreatAxe' | 'Staff' | 'Wand';
export type DamageType = 'Physical' | 'Fire' | 'Ice' | 'Magic';
