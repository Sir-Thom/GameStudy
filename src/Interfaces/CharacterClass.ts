import { ClassType } from './ClassType';

export interface CharacterClass {
  name: ClassType;
  base_stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    luck: number;
  };
  skills: string[];
}
