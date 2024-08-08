pub mod armor_damage_negation;
pub mod armor_info;

use crate::player::stats::PlayerStats;
use armor_info::{get_armor_damage_reduction, Armor};

#[tauri::command(rename_all = "snake_case")]
pub(super) fn calculate_damage_taken(
    armor_data: String,
    damage: f32,
    player_stats: String,
) -> Result<f32, String> {
    println!("armor_data: {:?}", armor_data);
    println!("damage: {:?}", damage);
    println!("player_stats: {:?}", player_stats);
    let armor_list: Vec<Armor> = serde_json::from_str(&armor_data)
        .map_err(|e| format!("Failed to parse armor data: {}", e))?;
    let stats_list: Vec<PlayerStats> = serde_json::from_str(&player_stats)
        .map_err(|e| format!("Failed to parse player stats: {}", e))?;
    let damage_taken = get_armor_damage_reduction(
        &armor_list.first().unwrap(),
        damage,
        &stats_list.first().unwrap(),
    );
    println!("Damage taken: {:?}", damage_taken);
    Ok(damage_taken)
}
