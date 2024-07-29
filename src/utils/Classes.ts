import { CharacterClass } from '../Interfaces/Classes';
import { ClassType } from '../Interfaces/ClassType';

export const DefaultWarriorClass: CharacterClass = {
  name: ClassType.Warrior,
  base_stats: {
    strength: 8,
    dexterity: 4,
    intelligence: 2,
    constitution: 7,
    luck: 3,
  },
  skills: ['Sword Mastery', 'Shield Bash', 'Battle Cry'],
};

export const DefaultMageClass: CharacterClass = {
  name: ClassType.Mage,
  base_stats: {
    strength: 3,
    dexterity: 4,
    intelligence: 9,
    constitution: 5,
    luck: 4,
  },
  skills: ['Fireball', 'Ice Barrier', 'Teleport'],
};

export const DefaultRogueClass: CharacterClass = {
  name: ClassType.Rogue,
  base_stats: {
    strength: 4,
    dexterity: 7,
    intelligence: 3,
    constitution: 4,
    luck: 6,
  },
  skills: ['Stealth', 'Backstab', 'Evasion'],
};

export const DefaultArcherClass: CharacterClass = {
  name: ClassType.Archer,
  base_stats: {
    strength: 5,
    dexterity: 8,
    intelligence: 4,
    constitution: 5,
    luck: 5,
  },
  skills: ['Precision Shot', 'Evasive Maneuvers', 'Marksmanship'],
};
