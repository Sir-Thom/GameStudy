use core::f32;

use classes::Classes;
use player_info::Player;
use stats::PlayerStats;

use crate::armor::{armor_info::Armor, calculate_damage_reduction};
pub mod classes;
pub mod inventory;
pub mod player_info;
pub mod stats;

fn calculate_hp(constitution_score: u32, level: u32) -> Result<u32, String> {
    const BASE_HP: u32 = 100;
    const CONSTITUTION_BONUS_PER_POINT: u32 = 5;
    const LEVEL_SCALING_FACTOR: u32 = 10;

    let constitution_bonus = constitution_score * CONSTITUTION_BONUS_PER_POINT;
    let level_bonus = level * LEVEL_SCALING_FACTOR;

    let total_hp = BASE_HP
        .checked_add(constitution_bonus)
        .ok_or("Overflow occurred during Constitution bonus calculation")?
        .checked_add(level_bonus)
        .ok_or("Overflow occurred during Level scaling calculation")?;

    println!(
        "Base HP: {}, Constitution Bonus: {}, Level Bonus: {}, Total HP: {}",
        BASE_HP, constitution_bonus, level_bonus, total_hp
    );

    Ok(total_hp)
}
#[tauri::command(rename_all = "snake_case")]
pub fn get_player_armor(armor_data: String) -> Result<(), String> {
    println!("armor_data: {:?}", armor_data);
    let armor_list: Vec<Armor> = serde_json::from_str(&armor_data)
        .map_err(|e| format!("Failed to parse armor data: {}", e))?;
    println!("Parsed armor data: {:?}", armor_list);
    // Further processing of armor_list if needed
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_player_stats(player_stats: String) -> Result<(), String> {
    println!("player_stats: {:?}", player_stats);
    let stats_list: Vec<PlayerStats> = serde_json::from_str(&player_stats)
        .map_err(|e| format!("Failed to parse player stats: {}", e))?;
    println!("Parsed player stats: {:?}", stats_list);
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_player_resistances(player_resistances: String) -> Result<(), String> {
    println!("player_resistances: {:?}", player_resistances);
    let resistances_list: Vec<PlayerStats> = serde_json::from_str(&player_resistances)
        .map_err(|e| format!("Failed to parse player resistances: {}", e))?;
    println!("Parsed player resistances: {:?}", resistances_list);
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn calculate_damage_taken(
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
    let damage_taken = calculate_damage_reduction(
        &armor_list.first().unwrap(),
        damage,
        &stats_list.first().unwrap(),
    );
    println!("Damage taken: {:?}", damage_taken);
    Ok(damage_taken)
}

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
    let hp = calculate_hp(class_stats.constitution, character.level)?;
    println!("character hp: {:?}", hp);
    character.hp = hp;
    println!("character hp: {:?}", character.hp);
    println!("Updated character with HP: {:?}", character);
    Ok(character)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_player_hp(constitution: u32, level: u32) -> Result<u32, String> {
    let hp = calculate_hp(constitution, level)?;
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

        let result = calculate_hp(constitution, level);

        assert_eq!(result, Ok(expected_hp));
    }

    #[test]
    fn test_create_character() {
        let class_data = json!({
            "name": "Test Class",
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
            "lightning_resistance": 2.5
        })
        .to_string();
        println!("class_data: {:?}", class_data);

        let character_data = json!({
            "name": "Test Character",
            "level": 5,
            "class_name": "Test Class",
            "hp": 0,
            "skills": [],
            "inventory": 0,
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
