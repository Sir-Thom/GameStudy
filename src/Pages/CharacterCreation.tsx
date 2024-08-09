import React, { useEffect, useState } from 'react';
import { ClassType } from '../types/ClassType';
import { ExtendedPlayer } from '../Interfaces/Player';
import { Classes } from '../Interfaces/Classes';
import { DefaultWarriorClass } from '../utils/Classes';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import PortraitSelection from '../components/CharacterCreation/PortraitViewer';

import { Armor } from '../Interfaces/Armor';
import { Weapon } from '../Interfaces/Weapon';
import {
  fetchClasses,
  fetchArmor,
  fetchWeapons,
  insertPlayer,
  insertPlayerStats,
  insertPlayerInventory,
} from '../utils/dbUtils';

const CharacterCreationPage: React.FC = () => {
  const db = Database.load('sqlite:character.db');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [armor, setArmor] = useState<Armor[]>([]);
  const [Classes, setClasses] = useState<Classes[]>([]);

  const [characterData, setCharacterData] = useState<ExtendedPlayer>({
    name: '',
    id: 0,
    level: 1,
    class_name: ClassType.Warrior,
    hp: 100,
    skills: [],
    inventory_id: 0,
    gold: 0,
    experience: 0,
    next_level_exp: 100,
    current_exp: 0,
    image: '',
    weapon_id: 0,
    armor_id: 0,
    accessory: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const [classes, armor, weapons] = await Promise.all([fetchClasses(db), fetchArmor(db), fetchWeapons(db)]);
      setClasses(classes);
      setArmor(armor);
      setWeapons(weapons);
    };
    loadData();
  }, [db]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const classData = Classes.find((cls) => cls.name === characterData.class_name);
    if (!classData) {
      console.error('Class data not found');
      return;
    }
    console.log('Class Data:', classData);

    try {
      const result = await invoke('create_character', {
        character_data: JSON.stringify(characterData),
        class_data: JSON.stringify({
          ...classData,
          base_stats: JSON.parse(classData.base_stats),
        }),
      });

      if (result) {
        const updatedCharacter: ExtendedPlayer = result as ExtendedPlayer;
        setCharacterData((prevData) => ({ ...prevData, ...updatedCharacter }));
        const playerId = await insertPlayer(db, updatedCharacter);
        await insertPlayerStats(db, playerId, updatedCharacter.class_name);

        const inventoryId = await insertPlayerInventory(db, playerId);
        await (await db).execute('UPDATE players SET inventory_id = ? WHERE id = ?', [inventoryId, playerId]);

        console.log('Character successfully created and saved to the database.');
      } else {
        console.error('Failed to create character');
      }
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  const handlePortraitSelect = (portrait: string) => {
    setCharacterData((prevData) => ({ ...prevData, image: portrait }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCharacterData((prevData) => ({
      ...prevData,
      [name]: name === 'weapon_id' || name === 'armor_id' ? parseInt(value, 10) : value,
    }));
  };

  const handleClassSelect = (selectedClass: ClassType) => {
    const selectedClassData = Classes.find((cls) => cls.name === selectedClass) || DefaultWarriorClass;
    setCharacterData((prevData) => ({ ...prevData, class_name: selectedClassData.name }));
  };

  return (
    <div className="character-creation-page">
      <h1>Create Your Character</h1>
      <form onSubmit={handleSubmit}>
        {/* Character Name Input */}
        <div>
          <label htmlFor="name">Character Name:</label>
          <input type="text" id="name" name="name" value={characterData.name} onChange={handleInputChange} required />
        </div>

        {/* Class Selection */}
        <div>
          <label>Choose Your Class:</label>
          <div>
            {Object.values(ClassType).map((classType) => (
              <button
                key={classType}
                type="button"
                onClick={() => handleClassSelect(classType)}
                className={`class-button ${characterData.class_name === classType ? 'selected' : ''}`}
              >
                {classType}
              </button>
            ))}
          </div>
        </div>

        {/* Portrait Selection */}
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
