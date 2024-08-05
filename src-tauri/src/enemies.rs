use crate::player::stats::PlayerResistances;
use enemies_info::{calculate_enemy_damage, Enemies};

pub mod enemies_info;

#[tauri::command(rename_all = "snake_case")]
pub fn get_enemy_damage(
    enemy_data: String,
    player_resistances: String,
    player_level: u32,
) -> Result<f32, String> {
    println!("enemy_data: {:?}", enemy_data);
    println!("player_resistances: {:?}", player_resistances);
    let enemy_list: Vec<Enemies> = serde_json::from_str(&enemy_data)
        .map_err(|e| format!("Failed to parse enemy data: {}", e))?;
    let resistances_list: Vec<PlayerResistances> = serde_json::from_str(&player_resistances)
        .map_err(|e| format!("Failed to parse player resistances: {}", e))?;
    let damage = calculate_enemy_damage(
        &enemy_list.first().unwrap(),
        &resistances_list.first().unwrap(),
        player_level,
    );
    println!("Damage taken: {:?}", damage);
    Ok(damage)
}
