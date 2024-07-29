pub mod armor_info;
use crate::player::stats::{PlayerStats, Stats};
use armor_info::Armor;

pub fn calculate_damage_reduction(
    armor: &Armor,
    incoming_damage: f32,
    player_stats: &&PlayerStats,
) -> f32 {
    let base_reduction = armor.defense_stat as f32;

    let strength_reduction = armor.strength_scaling.unwrap_or(0.0) * player_stats.strength as f32;
    let dexterity_reduction =
        armor.dexterity_scaling.unwrap_or(0.0) * player_stats.dexterity as f32;
    let intelligence_reduction =
        armor.intelligence_scaling.unwrap_or(0.0) * player_stats.intelligence as f32;
    let constitution_reduction =
        armor.constitution_scaling.unwrap_or(0.0) * player_stats.constitution as f32;
    let luck_reduction = armor.luck_scaling.unwrap_or(0.0) * player_stats.luck as f32;

    let total_scaling_reduction = strength_reduction
        + dexterity_reduction
        + intelligence_reduction
        + constitution_reduction
        + luck_reduction;
    let total_reduction = base_reduction + total_scaling_reduction;

    let special_reduction = match armor.ability_type.as_deref() {
        Some("defense") => armor.special_ability.unwrap_or(0.0),
        _ => 0.0,
    };

    let final_reduction = total_reduction + special_reduction;
    let reduced_damage = incoming_damage - final_reduction;

    if reduced_damage < 0.0 {
        0.0
    } else {
        reduced_damage
    }
}

pub fn get_damage_reduction(armor: &Armor, player_stats: Stats) -> f32 {
    let base_reduction = armor.defense_stat as f32;

    let strength_reduction = armor.strength_scaling.unwrap_or(0.0) * player_stats.strength as f32;
    let dexterity_reduction =
        armor.dexterity_scaling.unwrap_or(0.0) * player_stats.dexterity as f32;
    let intelligence_reduction =
        armor.intelligence_scaling.unwrap_or(0.0) * player_stats.intelligence as f32;
    let constitution_reduction =
        armor.constitution_scaling.unwrap_or(0.0) * player_stats.constitution as f32;
    let luck_reduction = armor.luck_scaling.unwrap_or(0.0) * player_stats.luck as f32;

    let total_scaling_reduction = strength_reduction
        + dexterity_reduction
        + intelligence_reduction
        + constitution_reduction
        + luck_reduction;
    let total_reduction = base_reduction + total_scaling_reduction;

    let special_reduction = match armor.ability_type.as_deref() {
        Some("defense") => armor.special_ability.unwrap_or(0.0),
        _ => 0.0,
    };

    let final_reduction = total_reduction + special_reduction;

    final_reduction
}

#[tauri::command]
pub fn calculate_damage_reduction_command(
    armor_data: String,
    incoming_damage: f32,
    player_stats: &&PlayerStats,
) -> f32 {
    let armor: Armor = serde_json::from_str(&armor_data).unwrap();
    calculate_damage_reduction(&armor, incoming_damage, player_stats)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_damage_reduction() {
        let armor = Armor {
            name: String::from("Test Armor"),
            picture: String::from("test.png"),
            defense_stat: 20,
            special_ability: Some(10.0), // Assume 10.0 is a reduction amount
            description: Some(String::from("Test armor with special ability")),
            ability_type: Some(String::from("defense")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = Stats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
        };

        let incoming_damage = 100.0;

        let strength_reduction =
            player_stats.strength as f32 * armor.strength_scaling.unwrap_or(0.0);
        let dexterity_reduction =
            player_stats.dexterity as f32 * armor.dexterity_scaling.unwrap_or(0.0);
        let intelligence_reduction =
            player_stats.intelligence as f32 * armor.intelligence_scaling.unwrap_or(0.0);
        let constitution_reduction =
            player_stats.constitution as f32 * armor.constitution_scaling.unwrap_or(0.0);
        let luck_reduction = player_stats.luck as f32 * armor.luck_scaling.unwrap_or(0.0);

        let scaling_reduction = strength_reduction
            + dexterity_reduction
            + intelligence_reduction
            + constitution_reduction
            + luck_reduction;
        let special_reduction = armor.special_ability.unwrap_or(0.0);
        let base_reduction = armor.defense_stat as f32;

        let expected_reduction = base_reduction + scaling_reduction + special_reduction;
        let expected_damage = incoming_damage - expected_reduction;

        let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, player_stats);

        assert_eq!(
            reduced_damage, expected_damage,
            "Expected: {}, Got: {}",
            expected_damage, reduced_damage
        );

        // Test with special ability not affecting defense
        let armor_no_defense_special = Armor {
            name: String::from("Basic Armor"),
            picture: String::from("basic.png"),
            defense_stat: 15,
            special_ability: Some(10.0),
            description: Some(String::from("Basic armor with no special ability")),
            ability_type: Some(String::from("attack")),
            strength_scaling: None,
            dexterity_scaling: None,
            intelligence_scaling: None,
            constitution_scaling: None,
            luck_scaling: None,
        };

        let player_stats_basic = Stats {
            strength: 0,
            dexterity: 0,
            intelligence: 0,
            constitution: 0,
            luck: 0,
        };

        let incoming_damage_basic = 30.0;
        let reduced_damage_basic = calculate_damage_reduction(
            &armor_no_defense_special,
            incoming_damage_basic,
            player_stats_basic,
        );

        let expected_reduction_basic = armor_no_defense_special.defense_stat as f32;
        let expected_damage_basic = incoming_damage_basic - expected_reduction_basic;

        assert_eq!(
            reduced_damage_basic, expected_damage_basic,
            "Expected: {}, Got: {}",
            expected_damage_basic, reduced_damage_basic
        );
    }
    #[test]
    fn test_calculate_damage_reduction_command() {
        let armor = Armor {
            name: String::from("Test Armor"),
            picture: String::from("test.png"),
            defense_stat: 20,
            special_ability: Some(10.0), // Assume 10.0 is a reduction amount or percentage
            description: Some(String::from("Test armor with special ability")),
            ability_type: Some(String::from("defense")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = Stats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
        };

        let incoming_damage = 100.0;

        let expected_damage = incoming_damage
            - (armor.defense_stat as f32
                + (player_stats.strength as f32 * armor.strength_scaling.unwrap_or(0.0))
                + (player_stats.dexterity as f32 * armor.dexterity_scaling.unwrap_or(0.0))
                + (player_stats.intelligence as f32 * armor.intelligence_scaling.unwrap_or(0.0))
                + (player_stats.constitution as f32 * armor.constitution_scaling.unwrap_or(0.0))
                + (player_stats.luck as f32 * armor.luck_scaling.unwrap_or(0.0))
                + armor.special_ability.unwrap_or(0.0));

        let reduced_damage = calculate_damage_reduction_command(
            serde_json::to_string(&armor).unwrap(),
            incoming_damage,
            player_stats,
        );

        assert_eq!(
            reduced_damage, expected_damage,
            "Expected: {}, Got: {}",
            expected_damage, reduced_damage
        );
    }
}
