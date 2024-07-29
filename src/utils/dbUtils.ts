import Database from '@tauri-apps/plugin-sql';
import { Classes } from '../Interfaces/Classes';
import { Weapon } from '../Interfaces/Weapon';
import { Armor } from '../Interfaces/Armor';
import { ExtendedPlayer, Player } from '../Interfaces/Player';
import { Inventory } from '../Interfaces/Inventory';

export const fetchClasses = async (db: Promise<Database>): Promise<Classes[]> => {
  try {
    const database = await db;
    return await database.select('SELECT * FROM classes');
  } catch (error) {
    console.error('Error fetching character classes:', error);
    throw error;
  }
};

export const fetchWeapons = async (db: Promise<Database>): Promise<Weapon[]> => {
  try {
    const database = await db;
    return await database.select('SELECT * FROM weapons');
  } catch (error) {
    console.error('Error fetching weapons:', error);
    throw error;
  }
};

export const fetchArmor = async (db: Promise<Database>): Promise<Armor[]> => {
  try {
    const database = await db;
    return await database.select('SELECT * FROM armor');
  } catch (error) {
    console.error('Error fetching armor:', error);
    throw error;
  }
};

export const fetchCharacters = async (db: Promise<Database>): Promise<ExtendedPlayer[]> => {
  try {
    const database = await db;
    return await database.select('SELECT id, name FROM players');
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
};

export const insertPlayer = async (db: Promise<Database>, player: Player): Promise<number> => {
  try {
    const database = await db;
    const insertResult = await database.execute(
      `
        INSERT INTO players (name, level, class_name, hp, skills, inventory_id, gold, experience, next_level_exp, current_exp, image, weapon_id, armor_id, accessory)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        player.name,
        player.level,
        player.class_name,
        player.hp,
        JSON.stringify(player.skills),
        player.inventory_id,
        player.gold,
        player.experience,
        player.next_level_exp,
        player.current_exp,
        player.image,
        player.weapon_id,
        player.armor_id,
        player.accessory,
      ],
    );

    const playerId = insertResult.lastInsertId;

    return playerId;
  } catch (error) {
    console.error('Error inserting player:', error);
    throw error;
  }
};

export const insertPlayerStats = async (db: Promise<Database>, playerId: number, className: string): Promise<void> => {
  try {
    const database = await db;
    await database.execute(
      `
        INSERT INTO player_stats (player_id, strength, dexterity, intelligence, constitution, luck)
        SELECT ?, 
               CAST(json_extract(base_stats, '$.strength') AS INTEGER), 
               CAST(json_extract(base_stats, '$.dexterity') AS INTEGER), 
               CAST(json_extract(base_stats, '$.intelligence') AS INTEGER), 
               CAST(json_extract(base_stats, '$.constitution') AS INTEGER), 
               CAST(json_extract(base_stats, '$.luck') AS INTEGER)
        FROM classes
        WHERE name = ?
      `,
      [playerId, className],
    );
  } catch (error) {
    console.error('Error inserting player stats:', error);
    throw error;
  }
};

export const insertPlayerInventory = async (db: Promise<Database>, playerId: number): Promise<number | null> => {
  try {
      const database = await db;
      const result = await database.execute('INSERT INTO inventory (player_id) VALUES ($1)', [playerId]);
      return result.lastInsertId; // Return the ID of the newly inserted inventory item
  } catch (error) {
      console.error('Error inserting player inventory:', error);
      return null;
  }
};


export const fetchPlayerInventory = async (db: Promise<Database>, playerId: number): Promise<Inventory> => {
  try {
    const database = await db;
    return await database.select('SELECT * FROM inventory WHERE id = $1', [playerId]);
  } catch (error) {
    console.error('Error fetching player inventory:', error);
    throw error;
  }
}

export const fetchPlayerArmor = async (db: Promise<Database>, armorId: number): Promise<string> => {
  try {
    const database = await db;
    console.log('Armor ID:', armorId);
    const Armor_data:Armor =  await database.select('SELECT * FROM armor WHERE id = $1', [armorId]);
    return JSON.stringify(Armor_data);
  } catch (error) {
    console.error('Error fetching player armor:', error);
    throw error;
  }
}

export const fetchPlayerStats = async (db: Promise<Database>, playerId: number): Promise<string> => {
  try {
    const database = await db;
    const playerStats = await database.select('SELECT * FROM player_stats WHERE player_id = $1', [playerId]);
    return JSON.stringify(playerStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
}

export const fetchPlayer = async (db: Promise<Database>, playerId: number): Promise<ExtendedPlayer> => {
  try {
    const database = await db;
    return await database.select('SELECT * FROM players WHERE id = $1', [playerId]);
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
}