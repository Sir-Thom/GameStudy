import Database from '@tauri-apps/plugin-sql';
export async function UpdatePlayerHealth(db: Promise<Database>,playerId: number, newHp: number){
const database = await db;
  return (await db).execute('UPDATE players SET hp = $1 WHERE id = $2', [newHp, playerId]);
}