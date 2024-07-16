// CharacterCreationPage.tsx

import React, { useEffect, useState } from 'react';
import { ClassType } from '../Interfaces/ClassType';
import { Character } from '../Interfaces/Character';
import { CharacterClass } from '../Interfaces/CharacterClass';
import { DefaultWarriorClass, DefaultMageClass, DefaultArcherClass, DefaultRogueClass } from '../utils/Classes';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';



const CharacterCreationPage: React.FC = () => {
 const db = Database.load("sqlite:character.db");
 const [weapons, setWeapons] = useState<any[]>([]);
  // State to manage character creation form data
  const [characterData, setCharacterData] = useState<Character & { class_id?: number }>({
    name: '',
    level: 0,
    class: DefaultWarriorClass,
    hp: 0,
    skills: [],
    inventory: [],
    gold: 0,
    experience: 0,
    next_level_exp: 0,
    current_exp: 0,
    image: '',
    weapon: '',
    armor: '',
    shield: '',
    accessory: ''
  });

  useEffect(() => {
    const fetchClassIds = async () => {
      try {
        const database = await db;
        const results = await database.select("SELECT id FROM character_classes WHERE name = ?", [characterData.class.name]);
        if (results.length > 0) {
          setCharacterData({ ...characterData, class_id: results[0].id });
        }
      } catch (error) {
        console.error('Error fetching class ID:', error);
        // Handle error as needed
      }
    };
  
      const fetchWeapons = async () => {
        try {
          const database = await db;
          const result: any[] = await database.select("SELECT * FROM weapons");
          setWeapons(result);
        } catch (error) {
          console.error('Error fetching weapons:', error);
          // Handle error as needed
        }
      };
  
   
    fetchWeapons();
    fetchClassIds();
  }, [characterData.class.name, db]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!characterData.class_id) {
        throw new Error('Class ID is not available.'); // Ensure class_id is available
      }

      const characterDataString = JSON.stringify(characterData);
      const response = await invoke('create_character', { characterData: characterDataString });

      // Insert character data into the characters table, including class_id
      await (await db).execute(`
        INSERT INTO characters (name, level, class_id, hp, skills, inventory, gold, experience, next_level_exp, current_exp, image, weapon, armor, shield, accessory)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        characterData.name,
        characterData.level,
        characterData.class_id,
        characterData.hp,
        JSON.stringify(characterData.skills),
        JSON.stringify(characterData.inventory),
        characterData.gold,
        characterData.experience,
        characterData.next_level_exp,
        characterData.current_exp,
        characterData.image,
        characterData.weapon,
        characterData.armor,
        characterData.shield,
        characterData.accessory,
      ]);

      console.log('Server response:', response);
    } catch (error) {
      console.error('Error creating character:', error);
      // Handle error as needed
    }
  };

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCharacterData({ ...characterData, [name]: value });
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

    setCharacterData({ ...characterData, class: selectedClassData });
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
              onClick={() => handleClassSelect(ClassType.Warrior)}
              className={`class-button ${characterData.class.name === ClassType.Warrior ? 'selected' : ''}`}
            >
              Warrior
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Mage)}
              className={`class-button ${characterData.class.name === ClassType.Mage ? 'selected' : ''}`}
            >
              Mage
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Archer)}
              className={`class-button ${characterData.class.name === ClassType.Archer ? 'selected' : ''}`}
            >
              Archer
            </button>
            <button
              onClick={() => handleClassSelect(ClassType.Rogue)}
              className={`class-button ${characterData.class.name === ClassType.Rogue ? 'selected' : ''}`}
            >
              Rogue
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="weapon">Choose Your Weapon:</label>
          <select
            id="weapon"
            name="weapon"
            value={characterData.weapon}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Weapon</option>
            {weapons.map((weapon: any) => (
              <option key={weapon.id} value={weapon.name}>{weapon.name}</option>
            ))}
          </select>
        </div>
        {/* Submit Button */}
        <div>
          <button type="submit">Create Character</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreationPage;
