export interface Weapon {
  id: number;
  name: string;
  type: WeaponType;
  damageType: DamageType;
  baseDamage: number;
  defenseProvided?: number; // Optional, not all weapons provide defense
  description?: string; // Optional, for additional details
}

export type WeaponType = 'SwordAndShield' | 'Dagger' | 'Bow' | 'GreatAxe' | 'Staff' | 'Wand';
export type DamageType = 'Physical' | 'Fire' | 'Ice' | 'Magic';
