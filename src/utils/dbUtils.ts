import Database from '@tauri-apps/plugin-sql';
import { Classes } from '../Interfaces/Classes';
import { Weapon } from '../Interfaces/Weapon';
import { Armor } from '../Interfaces/Armor';
import { ExtendedPlayer } from '../Interfaces/Player';

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
