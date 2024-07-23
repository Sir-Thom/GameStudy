import React, { useEffect, useState } from 'react';
import { ClassType } from '../Interfaces/ClassType';
import {ExtendedCharacter} from '../Interfaces/Character';
import { CharacterClass } from '../Interfaces/CharacterClass';
import { DefaultWarriorClass, DefaultMageClass, DefaultArcherClass, DefaultRogueClass } from '../utils/Classes';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import PortraitSelection from '../components/CharacterCreation/PortraitViewer';

const CharacterCreationPage: React.FC = () => {
  const db = Database.load("sqlite:character.db");
  const [weapons, setWeapons] = useState<any[]>([]);

  // State to manage character creation form data
  const [characterData, setCharacterData] = useState<ExtendedCharacter>({
    name: '',
    level: 1,
    class: DefaultWarriorClass,
    hp: 100,
    skills: [],
    inventory: [],
    gold: 0,
    experience: 0,
    next_level_exp: 0,
    current_exp: 0,
    image: '',
    weapon_id: 0,
    armor: '',
    shield: '',
    accessory: ''
  });

  useEffect(() => {
    const fetchClassIds = async () => {
      try {
        const database = await db;
        const results = await database.select("SELECT id FROM character_classes WHERE name = ?", [characterData.class.name]) as any[];
        if ((results as any[]).length > 0) {
          setCharacterData(prevData => ({ ...prevData, class_id: results[0].id }));
        } else {
          console.error('Class ID not found for class:', characterData.class.name);
        }
      } catch (error) {
        console.error('Error fetching class ID:', error);
      }
    };

    const fetchWeapons = async () => {
      try {
        const database = await db;
        const result: any[] = await database.select("SELECT * FROM weapons");
        setWeapons(result);
      } catch (error) {
        console.error('Error fetching weapons:', error);
      }
    };

    fetchWeapons();
    fetchClassIds();
  }, [characterData.class.name, db]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (characterData.class_id === undefined) {
        throw new Error('Class ID is not available.');
      }

      const characterDataString = JSON.stringify(characterData);
    const response: string = await invoke('create_character', { characterData: characterDataString });
    console.log('Server response:', response);
    let updatedCharacter: ExtendedCharacter;
    if (typeof response === 'string') {
      updatedCharacter = JSON.parse(response);
    } else {
      updatedCharacter = response; 
    }
    setCharacterData(updatedCharacter);

   

    console.log('Updated character data:', updatedCharacter.class_id);

    // Insert character data into the characters table
    await (await db).execute(`
      INSERT INTO characters (name, level, class_id, hp, skills, inventory, gold, experience, next_level_exp, current_exp, image, weapon_id, armor, shield, accessory)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      updatedCharacter.name,
      updatedCharacter.level,
      characterData.class_id,
      updatedCharacter.hp,
      JSON.stringify(updatedCharacter.skills),
      JSON.stringify(updatedCharacter.inventory),
      updatedCharacter.gold,
      updatedCharacter.experience,
      updatedCharacter.next_level_exp,
      updatedCharacter.current_exp,
      updatedCharacter.image,
      updatedCharacter.weapon_id,
      updatedCharacter.armor,
      updatedCharacter.shield,
      updatedCharacter.accessory,
    ]);

    console.log('Character successfully created and saved to the database.');

  } catch (error) {
    console.error('Error creating character:', error);
  }
};

  const handlePortraitSelect = (portrait: string) => {
    setCharacterData(prevData => ({ ...prevData, image: portrait }));
  };
  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCharacterData(prevData => ({
      ...prevData,
      [name]: name === 'weapon_id' ? parseInt(value, 10) : value
    }));
  };

  // Handle class selection
  const handleClassSelect = (selectedClass: ClassType) => {
    let selectedClassData: CharacterClass;

    switch (selectedClass) {
      case ClassType.Warrior:
        selectedClassData = DefaultWarriorClass;
        break;
      case ClassType.Mage:
        selectedClassData = DefaultMageClass;
        break;
      case ClassType.Archer:
        selectedClassData = DefaultArcherClass;
        break;
      case ClassType.Rogue:
        selectedClassData = DefaultRogueClass;
        break;
      default:
        selectedClassData = DefaultWarriorClass; // Default to Warrior if no match
    }

    setCharacterData(prevData => ({ ...prevData, class: selectedClassData }));
  };

  return (
    <div className="character-creation-page">
      <h1>Create Your Character</h1>
      <form onSubmit={handleSubmit}>
        {/* Character Name Input */}
        <div>
          <label htmlFor="name">Character Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={characterData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Class Selection */}
        <div>
          <label>Choose Your Class:</label>
          <div>
            <button
              type="button"
              onClick={() => handleClassSelect(ClassType.Warrior)}
              className={`class-button ${characterData.class.name === 'Warrior' ? 'selected' : ''}`}
            >
              Warrior
            </button>
            <button
              type="button"
              onClick={() => handleClassSelect(ClassType.Mage)}
              className={`class-button ${characterData.class.name === 'Mage' ? 'selected' : ''}`}
            >
              Mage
            </button>
            <button
              type="button"
              onClick={() => handleClassSelect(ClassType.Archer)}
              className={`class-button ${characterData.class.name === 'Archer' ? 'selected' : ''}`}
            >
              Archer
            </button>
            <button
              type="button"
              onClick={() => handleClassSelect(ClassType.Rogue)}
              className={`class-button ${characterData.class.name === 'Rogue' ? 'selected' : ''}`}
            >
              Rogue
            </button>
          </div>
        </div>

        {/* Weapon Selection */}
        <div>
          <label htmlFor="weapon">Choose Your Weapon:</label>
          <select
            id="weapon"
            name="weapon_id"
            value={characterData.weapon_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Weapon</option>
            {weapons.map((weapon: any) => (
              <option key={weapon.id} value={weapon.id}>{weapon.name}</option>
            ))}
          </select>
        </div>
        <PortraitSelection selectedPortrait={characterData.image} onSelect={handlePortraitSelect} />
        {/* Submit Button */}
        <div>
          <button type="submit">Create Character</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreationPage;
