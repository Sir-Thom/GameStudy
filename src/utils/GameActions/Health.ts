import Database from '@tauri-apps/plugin-sql';

export async function UpdatePlayerHealth(db: Promise<Database>,playerId: number, newHp: number){
  return (await db).execute('UPDATE players SET hp = $1 WHERE id = $2', [newHp, playerId]);
}

