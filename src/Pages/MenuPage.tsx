import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';
import { ExtendedPlayer } from '../Interfaces/Player';
import {
  countEnemies,
  fetchCharacters,
  fetchEnemy,
  fetchPlayer,
  fetchPlayerArmor,
  fetchPlayerResistances,
  fetchPlayerStats,
  fetchPlayerWeapon,
} from '../utils/dbUtils';
import { invoke } from '@tauri-apps/api/core';
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
  async function attackEnemy() {
    try {
      let enemyArray = await fetchEnemy(db, 1);
      let enemy = enemyArray[0];
      console.log('Enemy Data:', enemy);
      const playerArray = (await fetchPlayer(db, 1)) as unknown as ExtendedPlayer[];
      const player = playerArray[0];
      const playerId = player.id;

      const playerStats = await fetchPlayerStats(db, playerId);
      const playerWeapon = await fetchPlayerWeapon(db, player.weapon_id);
      const playerWeaponArray = JSON.parse(playerWeapon);
      const weaponData = playerWeaponArray[0];
      console.log('Player Weapon:', playerWeapon);
      const damageDealt = await invoke('calculate_damage_dealt', {
        weapon_data: playerWeapon,
        player_stats: playerStats,
      });
      console.log('Damage Dealt:', damageDealt);
      enemy.abilities = JSON.parse(enemy.abilities);
      const enemyDataString = JSON.stringify(enemy);

      console.log('Enemy Data String:', enemyDataString);
      const damgeToEnemyAfterDamageNegation = await invoke('get_enemy_damage_negation', {
        enemy: enemy,
        incoming_damage: damageDealt,
        weapon: weaponData,
      });
      console.log('Enemy Damage Negation:', damgeToEnemyAfterDamageNegation);
      const response = await invoke('apply_damage_to_enemy', {
        enemy_data: enemyDataString,
        damage: damgeToEnemyAfterDamageNegation,
        player_level: player.level,
      });

      console.log('enemy count: ', await countEnemies(db));
      const [updatedEnemyData, xpDrop, goldDrop] = response as [string, number, number];

      console.log('Updated enemy data:', updatedEnemyData);
      console.log('XP dropped:', xpDrop);
      console.log('Gold dropped:', goldDrop);

      if (xpDrop > 0 || goldDrop > 0) {
        console.log('The enemy has been defeated. Handle loot collection.');
      } else {
        console.log('The enemy is still alive.');
      }
    } catch (error) {
      console.error('Error attacking enemy:', error);
    }
  }

  const handleLoadCharacter = async () => {
    

    if (selectedCharacter !== null) {
      try {
        const playerArray = (await fetchPlayer(db, selectedCharacter)) as unknown as ExtendedPlayer[];
        const player = playerArray[0];
        console.log('Player Data:', player);

        if (!player) {
          console.error('Player data is undefined');
          return;
        }

        const playerId = player.id;
        const armorId = player.armor_id;

        const playerStats = await fetchPlayerStats(db, playerId);
        console.log('Player Stats:', playerStats);

        if (playerStats === '[]') {
          console.error('Player stats are empty');
          return;
        }
        const playerResistances = await fetchPlayerResistances(db, playerId);
        console.log('Player Resistances:', JSON.stringify(playerResistances));

        let enemyArray = await fetchEnemy(db, 1);
        if (!Array.isArray(enemyArray)) {
          enemyArray = [enemyArray];
        }

        enemyArray = enemyArray.map((enemy) => ({
          ...enemy,
          abilities: JSON.parse(enemy.abilities),
        }));

        const enemyDataString = JSON.stringify(enemyArray);
        
        await invoke('get_player_stats', { player_stats: playerStats });
        console.log('Player Stats:', JSON.parse(playerStats));
        const enemy_dmg = await invoke('get_enemy_damage', {
          enemy_data: enemyDataString,
          player_resistances: JSON.stringify(playerResistances),
          player_level: player.level,
        });
        console.log('player level', player.level);
        const playerHp = await invoke('get_player_hp', {
          constitution: JSON.parse(playerStats)[0].constitution,
          level: player.level,
        });
        console.log('Player HP:', playerHp);

        if (armorId !== undefined && armorId !== null) {
          const armorData = await fetchPlayerArmor(db, armorId);
          console.log('Armor Data:', armorData);
          const armor_damage_boost = await invoke('armor_damage_attack_increase', {armor_data: armorData});
          console.log('Armor Damage Boost:', armor_damage_boost);
          let damageTaken = await invoke('calculate_damage_taken', {
            armor_data: armorData,
            damage: enemy_dmg,
            player_stats: playerStats,
          });
          console.log('Damage Taken:', damageTaken);
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
        <Link to="/battle" replace={true}>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out">
            Start Battle
          </button>
        </Link>
        <Link to="/createquiz">
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-600 transition duration-300 ease-in-out">
            Create Quiz
          </button>
        </Link>
        <Link to="/settings">
          <button className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out">
            Settings
          </button>
        </Link>
        <button
          onClick={() => attackEnemy()}
          className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out"
        />
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
