pub mod classes;
pub mod inventory;
pub(super) mod player_health;
pub mod player_info;
pub mod stats;

use crate::armor::armor_info::Armor;
use classes::Classes;
use player_info::{player_hp, Player};
use stats::PlayerStats;

/// Get the player's armor and expose it to the frontend.
///
/// # Arguments
/// * `armor_data` - A JSON string representing the armor equipped by the player.
///
/// # Returns
/// An empty result if the armor data was parsed successfully.
///
#[tauri::command(rename_all = "snake_case")]
pub fn get_player_armor(armor_data: String) -> Result<(), String> {
    println!("armor_data: {:?}", armor_data);
    let armor_list: Vec<Armor> = serde_json::from_str(&armor_data)
        .map_err(|e| format!("Failed to parse armor data: {}", e))?;
    println!("Parsed armor data: {:?}", armor_list);
    Ok(())
}

/// Get the player's stats and expose it to the frontend.
///     
/// # Arguments
/// * `player_stats` - A JSON string representing the player's stats.
///
/// # Returns
/// An empty result if the player stats were parsed successfully.
#[tauri::command(rename_all = "snake_case")]
pub fn get_player_stats(player_stats: String) -> Result<(), String> {
    println!("player_stats: {:?}", player_stats);
    let stats_list: Vec<PlayerStats> = serde_json::from_str(&player_stats)
        .map_err(|e| format!("Failed to parse player stats: {}", e))?;
    println!("Parsed player stats: {:?}", stats_list);
    Ok(())
}
/// Get the player's resistances and expose it to the frontend.
///
/// # Arguments
/// * `player_resistances` - A JSON string representing the player's resistances.
///
/// # Returns
/// An empty result if the player resistances were parsed successfully.
#[tauri::command(rename_all = "snake_case")]
pub fn get_player_resistances(player_resistances: String) -> Result<(), String> {
    println!("player_resistances: {:?}", player_resistances);
    let resistances_list: Vec<PlayerStats> = serde_json::from_str(&player_resistances)
        .map_err(|e| format!("Failed to parse player resistances: {}", e))?;
    println!("Parsed player resistances: {:?}", resistances_list);
    Ok(())
}

/// Create a new character and expose it to the frontend.
///
/// # Arguments
/// * `character_data` - A JSON string representing the character's data.
/// * `class_data` - A JSON string representing the class's data.
///
/// # Returns
/// The created character with updated HP.
#[tauri::command(rename_all = "snake_case")]
pub fn create_character(character_data: String, class_data: String) -> Result<Player, String> {
    println!("character_data: {:?}", character_data);
    println!("class_data: {:?}", class_data);
    let mut character: Player = serde_json::from_str(&character_data)
        .map_err(|e| format!("Failed to parse character data: {}", e))?;
    let character_class: Classes = serde_json::from_str(&class_data)
        .map_err(|e| format!("Failed to parse class data: {}", e))?;
    let class_stats = character_class.base_stats;
    println!("class_stats: {:?}", class_stats);
    let hp = player_hp(class_stats.constitution, character.level)?;
    println!("character hp: {:?}", hp);
    character.hp = hp;
    println!("character hp: {:?}", character.hp);
    println!("Updated character with HP: {:?}", character);
    Ok(character)
}

/// Get the player's HP and expose it to the frontend.
///
/// # Arguments
/// * `constitution` - The player's constitution.
/// * `level` - The player's level.
///
/// # Returns
/// The player's HP.
#[tauri::command(rename_all = "snake_case")]
pub fn get_player_hp(constitution: u32, level: u32) -> Result<u32, String> {
    let hp = player_hp(constitution, level)?;
    Ok(hp)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_calculate_hp() {
        let constitution = 10;
        let level = 5;

        let expected_hp = 100 + (constitution * 5) + (level * 10);

        let result = player_hp(constitution, level);

        assert_eq!(result, Ok(expected_hp));
    }

    #[test]
    fn test_create_character() {
        let class_data = json!({
            "name": "Test Class",
            "description": "Test Description",
            "base_stats": {
                "strength": 10,
                "dexterity": 10,
                "intelligence": 10,
                "constitution": 10,
                "luck": 10
            },
            "skills": "Basic Skills",
            "fire_resistance": 10.0,
            "magic_resistance": 5.0,
            "frost_resistance": 0.0,
            "lightning_resistance": 2.5,
            "starting_weapon_id": 0,
            "starting_armor_id": 0
        })
        .to_string();

        let character_data = json!({
            "name": "Test Character",
            "level": 5,
            "class_name": "Test Class",
            "hp": 0,
            "skills": [],
            "inventory_id": 0,
            "gold": 0,
            "experience": 0,
            "next_level_exp": 0,
            "current_exp": 0,
            "image": "",
            "weapon_id": 0,
            "armor_id": 0,
            "accessory": ""
        })
        .to_string();

        let result = create_character(character_data, class_data);

        assert!(
            result.is_ok(),
            "Character creation failed with error: {:?}",
            result.err()
        );
        let result_character = result.unwrap();

        let expected_hp = 100 + (10 * 5) + (5 * 10); // 100 + 50 + 50 = 200

        assert_eq!(result_character.hp, expected_hp);
    }
}
