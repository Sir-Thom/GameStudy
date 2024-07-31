import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';
import { ExtendedPlayer } from '../Interfaces/Player';
import { fetchCharacters, fetchPlayer, fetchPlayerArmor, fetchPlayerStats } from '../utils/dbUtils';
import { invoke } from '@tauri-apps/api/core';

import '../App.css';
import Inventory from '../components/Inventory/inventory';

const MainMenu: React.FC = () => {
  const [characters, setCharacters] = useState<ExtendedPlayer[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const db = Database.load('sqlite:character.db');

  useEffect(() => {
    fetchCharacters(db).then((result) => setCharacters(result));
    fetchCharacters(db);
  }, [db]);

  const handleCharacterSelect = (id: number) => {
    setSelectedCharacter(id);
  };

  const handleLoadCharacter = async () => {
    if (selectedCharacter !== null) {
      try {
        // Fetch the player data
        const playerArray = (await fetchPlayer(db, selectedCharacter)) as unknown as ExtendedPlayer[];
        const player = playerArray[0]; // Access the first element if it's an array
        console.log('Player Data:', player);

        if (!player) {
          console.error('Player data is undefined');
          return;
        }

        const playerId = player.id;
        const armorId = player.armor_id;

        // Fetch player stats
        const playerStats = await fetchPlayerStats(db, playerId);
        console.log('Player Stats:', playerStats);

        // Ensure playerStats is not empty and properly formatted
        if (playerStats === '[]') {
          console.error('Player stats are empty');
          return;
        }

        // Invoke the Rust function with player stats
        await invoke('get_player_stats', { player_stats: playerStats });

        // Fetch armor data
        if (armorId !== undefined && armorId !== null) {
          const armorData = await fetchPlayerArmor(db, armorId);
          console.log('Armor Data:', armorData);

          // Invoke the Rust function with armor data
          await invoke('calculate_damage_taken', { armor_data: armorData, damage: 42.1, player_stats: playerStats });
        } else {
          console.error('Armor ID is undefined');
        }

        console.log(`Loading character with ID: ${selectedCharacter}`);
      } catch (error) {
        console.error('Error loading character:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Main Menu</h1>
      <div className="flex flex-col gap-4 mb-8">
        <Link to="/character-creation">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out">
            Create Character
          </button>
        </Link>
        <Link to="/battle">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out">
            Start Battle
          </button>
        </Link>
        <Link to="/inventory">
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-600 transition duration-300 ease-in-out">
            Inventory
          </button>
        </Link>
        <Link to="/settings">
          <button className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out">
            Settings
          </button>
        </Link>
      </div>
      <Inventory />
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Load Character</h2>
        <select
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
          value={selectedCharacter || ''}
          onChange={(e) => handleCharacterSelect(parseInt(e.target.value, 10))}
        >
          <option value="">Select Character</option>
          {characters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleLoadCharacter}
          className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition duration-300 ease-in-out"
          disabled={selectedCharacter === null}
        >
          Load Character
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
