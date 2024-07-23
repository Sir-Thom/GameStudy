import { CharacterClass } from "./CharacterClass";

export interface Character {
    name: string;
    level: number;
    class: CharacterClass;
    hp: number;
    skills: string[];
    inventory: string[];
    gold: number;
    experience: number;
    next_level_exp: number;
    current_exp: number;
    image: string;
    weapon_id: number;
    armor: string;
    shield: string;
    accessory: string;
}
export interface ExtendedCharacter extends Character {
    class_id?: number; 
  }