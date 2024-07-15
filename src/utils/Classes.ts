import { CharacterClass } from "../Interfaces/CharacterClass";
import { ClassType } from "../Interfaces/ClassType";

export const DefaultWarriorClass: CharacterClass = {
  name: ClassType.Warrior,
  baseStats: {
    strength: 8,
    dexterity: 4,
    intelligence: 2,
    constitution: 7,
    luck: 3,
  },
  skills: [
    "Sword Mastery",
    "Shield Bash",
    "Battle Cry",
  ],
};

export const DefaultMageClass: CharacterClass = {
    name: ClassType.Mage,
    baseStats: {
      strength: 3,
      dexterity: 4,
      intelligence: 9,
      constitution: 5,
      luck: 4,
    },
    skills: [
      "Fireball",
      "Ice Barrier",
      "Teleport",
    ],
  };

  export const DefaultRogueClass: CharacterClass = {
    name: ClassType.Rogue,
    baseStats: {
      strength: 4,
      dexterity: 7,
      intelligence: 3,
      constitution: 4,
      luck: 6,
    },
    skills: [
      "Stealth",
      "Backstab",
      "Evasion",
    ],
  };

  export const DefaultArcherClass: CharacterClass = {
    name: ClassType.Archer,
    baseStats: {
      strength: 5,
      dexterity: 8,
      intelligence: 4,
      constitution: 5,
      luck: 5,
    },
    skills: [
      "Precision Shot",
      "Evasive Maneuvers",
      "Marksmanship",
    ],
  };