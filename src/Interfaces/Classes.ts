export interface Classes {
  id: number;
  name: string;
  description: string;
  base_stats: string; // JSON string
  skills: string; // JSON string
  fire_resistance: number;
  magic_resistance: number;
  frost_resistance: number;
  lightning_resistance: number;
  starting_weapon_id: number;
  starting_armor_id: number;

}
