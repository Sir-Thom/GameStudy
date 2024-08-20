mod weapon_damage;
pub mod weapon_info;
pub mod weapon_types;

use crate::player::stats::PlayerStats;
use weapon_info::{get_weapon_damage, Weapon};

/// Calculate the damage dealt by the player and expose it to the front end.
///     
/// # Arguments
/// * `weapon_data` - A JSON string representing the weapon equipped by the player.
/// * `player_stats` - A JSON string representing the player's stats.
///
/// # Returns
/// The amount of damage dealt by the player.
#[tauri::command(rename_all = "snake_case")]
pub fn calculate_damage_dealt(weapon_data: String, player_stats: String) -> Result<u32, String> {
    println!("weapon_data: {:?}", weapon_data);
    println!("player_stats: {:?}", player_stats);
    let weapon_list: Vec<Weapon> = serde_json::from_str(&weapon_data)
        .map_err(|e| format!("Failed to parse weapon data: {}", e))?;
    let stats_list: Vec<PlayerStats> = serde_json::from_str(&player_stats)
        .map_err(|e| format!("Failed to parse player stats: {}", e))?;
    let damage_dealt =
        get_weapon_damage(&weapon_list.first().unwrap(), &stats_list.first().unwrap());
    println!("Damage dealt: {:?}", damage_dealt);
    Ok(damage_dealt)
}
