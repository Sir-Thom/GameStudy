export interface Weapon {
  id: number;
  name: string;
  type: WeaponType;
  damage_type: DamageType;
  base_damage: number;
  defense_provided?: number;
  description?: string;
}

export enum WeaponType {
  SwordAndShield = 'SwordAndShield',
  GreatSword = 'GreatSword',
  Dagger = 'Dagger',
  Bow = 'Bow',
  GreatAxe = 'GreatAxe',
  Staff = 'Staff',
  Wand = 'Wand',
  Spear = 'Spear',
  GreatSper = 'GreatSpear',
  Hammer = 'Hammer',
  WarHammer = 'WarHammer',
  Crossbow = 'Crossbow',
}

export type DamageType = 'Physical' | 'Fire' | 'Ice' | 'Magic';
