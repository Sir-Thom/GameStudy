use crate::player::stats::PlayerResistances;
use enemies_info::{calculate_enemy_damage, calculate_enemy_drops, Enemies};

pub mod enemies_info;

/// Calculate the damage taken by the player after armor reduction and expose it t.
///
/// # Arguments
/// * `enemy_data` - A JSON string representing the enemy's stats.
/// * `player_resistances` - A JSON string representing the player's resistances.
/// * `player_level` - The level of the player.
///
/// # Returns
/// The amount of damage taken by the player after armor reduction
#[tauri::command(rename_all = "snake_case")]
pub fn get_enemy_damage(
    enemy_data: String,
    player_resistances: String,
    player_level: u32,
) -> Result<f32, String> {
    println!("enemy_data: {:?}", enemy_data);
    println!("player_resistances: {:?}", player_resistances);

    // Deserialize JSON arrays
    let enemies: Vec<Enemies> = serde_json::from_str(&enemy_data)
        .map_err(|e| format!("Failed to parse enemy data: {}", e))?;

    let resistances_list: Vec<PlayerResistances> = serde_json::from_str(&player_resistances)
        .map_err(|e| format!("Failed to parse player resistances: {}", e))?;

    // Ensure there is at least one enemy and one resistance
    let enemy = enemies.first().ok_or("No enemy data found")?;
    let resistance = resistances_list
        .first()
        .ok_or("No player resistance data found")?;

    let damage = calculate_enemy_damage(enemy, resistance, player_level);
    println!("Damage taken: {:?}", damage);

    Ok(damage)
}

/// Apply damage to an enemy and calculate the experience and gold drops  and expose it to JavaScript.
///
/// # Arguments
/// * `enemy_data` - A JSON string representing the enemy's stats.
/// * `damage` - The amount of damage dealt to the enemy.
/// * `player_level` - The level of the player.
///
/// # Returns
/// A tuple containing the updated enemy data, the experience drop, and the gold drop.
#[tauri::command(rename_all = "snake_case")]
pub fn apply_damage_to_enemy(
    enemy_data: String,
    damage: f32,
    player_level: u32,
) -> Result<(String, u32, u32), String> {
    let mut enemy: Enemies = serde_json::from_str(&enemy_data)
        .map_err(|e| format!("Failed to parse enemy data: {}", e))?;

    let is_dead = enemy.take_damage(damage);

    let (xp_drop, gold_drop) = if is_dead {
        calculate_enemy_drops(&enemy, player_level)
    } else {
        (0, 0)
    };

    let updated_enemy_data = serde_json::to_string(&enemy)
        .map_err(|e| format!("Failed to serialize updated enemy data: {}", e))?;

    Ok((updated_enemy_data, xp_drop, gold_drop))
}
