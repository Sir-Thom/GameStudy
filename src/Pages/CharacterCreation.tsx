import React, { useEffect, useState } from 'react';
import { ClassType } from '../types/ClassType';
import { ExtendedPlayer } from '../Interfaces/Player';
import { Classes } from '../Interfaces/Classes';
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
import ClassSelectionModal from '../components/CharacterCreation/ClassSelectionModal'; // Import the modal component

const CharacterCreationPage: React.FC = () => {
  const db = Database.load('sqlite:character.db');
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [armor, setArmor] = useState<Armor[]>([]);
  const [classes, setClasses] = useState<Classes[]>([]);
  const [selectedClass, setSelectedClass] = useState<'' | ClassType>('');
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classes, armor, weapons] = await Promise.all([
          fetchClasses(db),
          fetchArmor(db),
          fetchWeapons(db),
        ]);

        setClasses(classes);
        setArmor(armor);
        setWeapons(weapons);

     
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [db]);

  const updateClassData = (className: ClassType) => {
    const selectedClassData = classes.find((cls) => cls.name === className 
    ) || { name: "" , starting_weapon_id: 0, starting_armor_id: 0};
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
    setIsModalOpen(false);
  };

  const startingWeapon = weapons.find((weapon) => weapon.id === characterData.weapon_id);
  const startingArmor = armor.find((armor) => armor.id === characterData.armor_id);

  const selectedClassData = classes.find((cls) => cls.name === characterData.class_name) || { name: "", description: "" };

  return (
    <div className="w-screen h-screen text-black bg-white p-8">
    <h1 className="text-4xl font-bold mb-6">Create Your Character</h1>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Character Details Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
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

        {/* Class Selection Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
          >
            Select Your Class
          </button>
          <p className="mt-2 text-sm text-gray-500">
            {selectedClassData.name}
          </p>
        </div>

        {/* Portrait Selection */}
        <PortraitSelection selectedPortrait={characterData.image} onSelect={handlePortraitSelect} />


        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
        >
          Create Character
        </button>
      </div>

      {/* Character Preview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Class Preview</h2>
        {selectedClassData.name && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Class:</h3>
            <p>{selectedClassData.name}</p>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Base Stats:</h4>
              <ul>
                {Object.entries(JSON.parse(selectedClassData.base_stats)).map(([stat, value]) => (
                  <li key={stat}>
                    <span className="font-semibold">{stat}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Starting Weapon:</h4>
              {startingWeapon ? (
                <p>{startingWeapon.name}</p>
              ) : (
                <p>No starting weapon</p>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Starting Armor:</h4>
              {startingArmor ? (
                <p>{startingArmor.name}</p>
              ) : (
                <p>No starting armor</p>
              )}
            </div>
          </div>
        )}
      </div>
    </form>

    {/* Class Selection Modal */}
    {isModalOpen && (
      <ClassSelectionModal
        classes={classes}
        selectedClass={selectedClass as ClassType}
        onClassSelect={handleClassSelect}
        onClose={() => setIsModalOpen(false)}
      />
    )}
  </div>
);
};
export default CharacterCreationPage;
