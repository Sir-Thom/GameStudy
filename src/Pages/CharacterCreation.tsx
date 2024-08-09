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
  getClassDescription,
} from '../utils/dbUtils';

const CharacterCreationPage: React.FC = () => {
  const db = Database.load('sqlite:character.db');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [armor, setArmor] = useState<Armor[]>([]);
  const [classes, setClasses] = useState<Classes[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | ''>('');
  const [characterData, setCharacterData] = useState<ExtendedPlayer>({
    name: '',
    id: 0,
    level: 1,
    class_name: '',
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
      try {
        const [classes, armor, weapons] = await Promise.all([fetchClasses(db), fetchArmor(db), fetchWeapons(db)]);

        setClasses(classes);
        setArmor(armor);
        setWeapons(weapons);

        if (!characterData.class_name) {
          const defaultClass = DefaultWarriorClass;
          setCharacterData((prevData) => ({
            ...prevData,
            class_name: defaultClass.name,
            weapon_id: defaultClass.starting_weapon_id,
            armor_id: defaultClass.starting_armor_id,
          }));
          setSelectedClass(defaultClass.name);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [db, characterData.class_name]);

  const updateClassData = (className: ClassType) => {
    const selectedClassData = classes.find((cls) => cls.name === className) || DefaultWarriorClass;
    setCharacterData((prevData) => ({
      ...prevData,
      class_name: selectedClassData.name,
      weapon_id: selectedClassData.starting_weapon_id,
      armor_id: selectedClassData.starting_armor_id,
    }));
    setSelectedClass(className);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!characterData.class_name) {
      console.error('No class selected');
      return;
    }

    const classData = classes.find((cls) => cls.name === characterData.class_name);
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

  const handleClassSelect = (className: ClassType) => {
    updateClassData(className);
    if (className) {
      getClassDescription(db, className).then((description) => {
        console.log('Class Description:', description);
      });
    }
  };

  const startingWeapon = weapons.find((weapon) => weapon.id === characterData.weapon_id);
  const startingArmor = armor.find((armor) => armor.id === characterData.armor_id);

  const selectedClassData = classes.find((cls) => cls.name === characterData.class_name) || DefaultWarriorClass;

  return (
    <div className="w-screen text-black bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6">Create Your Character</h1>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Character Name Input */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-lg font-semibold mb-2">
            Character Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={characterData.name}
            onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Class Selection */}
        <div className="mb-6">
          <label htmlFor="class" className="block text-lg font-semibold mb-2">
            Choose Your Class:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.name}
                onClick={() => handleClassSelect(cls.name as ClassType)}
                className={`cursor-pointer p-4 border rounded-lg shadow-md transition-transform transform hover:scale-105 ${characterData.class_name === cls.name ? 'bg-blue-100' : 'bg-white'}`}
              >
                <h3 className="text-xl font-semibold">{cls.name}</h3>
                <img src={`/images/classes/${cls.name}.png`} alt={cls.name} className="w-full h-32 object-cover mt-2" />
              </div>
            ))}
          </div>

          {/* Class Description */}
          <div className="bg-gray-50 p-6 rounded-md shadow-sm mt-6">
            <h2 className="text-xl font-semibold mb-4">Class Description:</h2>
            <p>{selectedClassData.description}</p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Starting Weapon:</h3>
              {startingWeapon ? (
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={`/images/weapons/${startingWeapon.name}`}
                    alt={startingWeapon.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{startingWeapon.name}</p>
                    <p>{startingWeapon.description}</p>
                  </div>
                </div>
              ) : (
                <p>No weapon available</p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Starting Armor:</h3>
              {startingArmor ? (
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={`/images/armor/${startingArmor.name}`}
                    alt={startingArmor.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{startingArmor.name}</p>
                    <p>{startingArmor.description}</p>
                  </div>
                </div>
              ) : (
                <p>No armor available</p>
              )}
            </div>
          </div>
        </div>

        {/* Portrait Selection */}
        <div className="mb-6">
          <PortraitSelection selectedPortrait={characterData.image} onSelect={handlePortraitSelect} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors"
          >
            Create Character
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterCreationPage;
