import React, { useEffect, useState } from 'react';
import { ClassType } from '../Interfaces/ClassType';
import { ExtendedPlayer } from '../Interfaces/Player';
import { Classes } from '../Interfaces/Classes';
import { DefaultWarriorClass } from '../utils/Classes';
import { invoke } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import PortraitSelection from '../components/CharacterCreation/PortraitViewer';
import { FpsView } from 'react-fps';
import { Armor } from '../Interfaces/Armor';
import { Weapon } from '../Interfaces/Weapon';
import {
  fetchClasses,
  fetchArmor,
  fetchWeapons,
  insertPlayer,
  insertPlayerStats,
  insertPlayerInventory,
  fetchPlayerArmor,
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
    fetchClasses(db).then((result) => setClasses(result));
    fetchArmor(db).then((result) => setArmor(result));
    fetchWeapons(db).then((result) => setWeapons(result));
    fetchClasses(db);
    fetchWeapons(db);
    fetchArmor(db);
  }, [db]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const classData = Classes.find((cls) => cls.name === characterData.class_name);
    if (!classData) {
      console.error('Class data not found');
      return;
    }

    try {
      const result = await invoke('create_character', {
        character_data: JSON.stringify(characterData),
        class_data: JSON.stringify({
          ...classData,
          base_stats: JSON.parse(classData.base_stats),
          // Exclude player_id if not required
        }),
      });
      console.log('Character Data:', characterData);
      console.log('Class Data:', classData);

      if (result) {
        const updatedCharacter: ExtendedPlayer = result as ExtendedPlayer;
        setCharacterData((prevData) => ({ ...prevData, ...updatedCharacter }));
        let playerId = await insertPlayer(db, updatedCharacter).then((id) => id);
        insertPlayerStats(db, playerId, updatedCharacter.class_name);
        const inventoryId = await insertPlayerInventory(db, playerId);
        await (await db).execute('UPDATE players SET inventory_id = ? WHERE id = ?', [inventoryId, playerId]);
        const armorData = await fetchPlayerArmor(db, updatedCharacter.armor_id);
        console.log('Armor Data:', armorData);
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
      <FpsView width={240} height={180} left={60} top={80} />
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

        {/* Weapon Selection */}
        <div>
          <label htmlFor="weapon">Choose Your Weapon:</label>
          <select id="weapon" name="weapon_id" value={characterData.weapon_id} onChange={handleInputChange} required>
            <option value="">Select Weapon</option>
            {weapons.map((weapon) => (
              <option key={weapon.id} value={weapon.id}>
                {weapon.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="armor">Choose Your Armor:</label>
          <select id="armor" name="armor_id" value={characterData.armor_id} onChange={handleInputChange} required>
            <option value="">Select Armor</option>
            {armor.map((armor) => (
              <option key={armor.id} value={armor.id}>
                {armor.name}
              </option>
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
