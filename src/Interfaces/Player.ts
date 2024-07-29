export interface Player {
  name: string;
  level: number;
  class_name: string;
  hp: number;
  skills: string[];
  inventory: string[];
  gold: number;
  experience: number;
  next_level_exp: number;
  current_exp: number;
  image: string;
  weapon_id: number;
  armor_id: number;
  accessory: string;
}

export interface ExtendedPlayer extends Player {
  id: number;
  class_id?: number;
}
