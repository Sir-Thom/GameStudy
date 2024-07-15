import { ClassType } from "./ClassType";


export interface CharacterClass {
    name: ClassType;
    baseStats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      constitution: number;
      luck: number;
    };
    skills: string[];
  }