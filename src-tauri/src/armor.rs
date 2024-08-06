pub mod armor_info;
use crate::player::stats::PlayerStats;
use armor_info::Armor;

/// Calculate the damage reduction based on the armor and scale it with the player's stats
/// - armor: The armor to calculate the damage reduction for the armor
/// - incoming_damage: The incoming damage to calculate the reduction of the damage
/// - player_stats: The player's stats to scale the damage reduction
/// Returns the reduced damage
///
/// Calculates the damage reduction based on the armor and player stats.
///
/// # Formula
///
/// 1. **Base Reduction**:
///    - `base_reduction = armor.defense_stat`
///
/// 2. **Scaling Reductions**:
///    - `strength_reduction = 0.03 * armor.strength_scaling * player_stats.strength`
///    - `dexterity_reduction = 0.03 * armor.dexterity_scaling * player_stats.dexterity`
///    - `intelligence_reduction = 0.03 * armor.intelligence_scaling * player_stats.intelligence`
///    - `constitution_reduction = 0.03 * armor.constitution_scaling * player_stats.constitution`
///    - `luck_reduction = 0.03 * armor.luck_scaling * player_stats.luck`
///
/// 3. **Total Scaling Reduction**:
///    - `total_scaling_reduction = strength_reduction + dexterity_reduction + intelligence_reduction + constitution_reduction + luck_reduction`
///
/// 4. **Total Reduction**:
///    - `total_reduction = base_reduction + total_scaling_reduction`
///
/// 5. **Special Reduction**:
///    - `special_reduction = if armor.ability_type == "defense" { armor.special_ability } else { 0.0 }`
///
/// 6. **Final Reduction** (Capped at 80%):
///    - `final_reduction = min(total_reduction + special_reduction, 80.0)`
///
/// 7. **Damage to Take** (Ensuring it is not less than 20% of incoming damage):
///    - `damage_to_take = max(incoming_damage * (1.0 - final_reduction / 100.0), 0.2 * incoming_damage)`
///
/// # Example
/// ```
/// use crate::armor::calculate_damage_reduction;
/// use crate::player::stats::PlayerStats;
/// use crate::armor::armor_info::Armor;
///
/// let armor = Armor {
///   name: String::from("Test Armor"),
///   picture: String::from("test.png"),
///   defense_stat: 20,
///   special_ability: Some(10.0),
///   description: Some(String::from("Test armor with special ability")),
///   ability_type: Some(String::from("defense")),
///   strength_scaling: Some(0.1),
///   dexterity_scaling: Some(0.2),
///   intelligence_scaling: Some(0.3),
///   constitution_scaling: Some(0.4),
///   luck_scaling: Some(0.5),
/// };
///
/// let player_stats = PlayerStats {
///    strength: 10,
///    dexterity: 20,
///    intelligence: 30,
///    constitution: 40,
///    luck: 50,
///    player_id: 1,
/// };
///
/// let incoming_damage = 100.0;
///
/// let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, &player_stats);
///
/// println!("Reduced damage: {}", reduced_damage);

pub fn calculate_damage_reduction(
    armor: &Armor,
    incoming_damage: f32,
    player_stats: &PlayerStats,
) -> f32 {
    let base_reduction = armor.defense_stat as f32;

    let strength_reduction =
        0.03 * armor.strength_scaling.unwrap_or(0.0) * player_stats.strength as f32;
    let dexterity_reduction =
        0.03 * armor.dexterity_scaling.unwrap_or(0.0) * player_stats.dexterity as f32;
    let intelligence_reduction =
        0.03 * armor.intelligence_scaling.unwrap_or(0.0) * player_stats.intelligence as f32;
    let constitution_reduction =
        0.03 * armor.constitution_scaling.unwrap_or(0.0) * player_stats.constitution as f32;
    let luck_reduction = 0.03 * armor.luck_scaling.unwrap_or(0.0) * player_stats.luck as f32;

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

    let final_reduction = (total_reduction + special_reduction).min(80.0);

    let damage_to_take =
        (incoming_damage * (1.0 - final_reduction / 100.0)).max(0.2 * incoming_damage);

    println!("incoming_damage: {}", incoming_damage);
    println!("final_reduction: {}", final_reduction);
    println!("damage_to_take: {}", damage_to_take);

    damage_to_take
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
            special_ability: Some(10.0),
            description: Some(String::from("Test armor with special ability")),
            ability_type: Some(String::from("defense")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = PlayerStats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
            player_id: 1,
        };

        let incoming_damage = 100.0;

        let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, &player_stats);

        println!("Reduced damage: {}", reduced_damage);
        assert!(reduced_damage >= 20.0);
    }

    #[test]
    fn test_damage_reduction_with_reduction_bigger_than_cap() {
        let armor = Armor {
            name: String::from("Test Armor"),
            picture: String::from("test.png"),
            defense_stat: 20,
            special_ability: Some(100.0),
            description: Some(String::from("Test armor with special ability")),
            ability_type: Some(String::from("defense")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = PlayerStats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
            player_id: 1,
        };

        let incoming_damage = 100.0;

        let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, &player_stats);
        let reduced_damage_percentage =
            incoming_damage - (reduced_damage / incoming_damage * 100.0);
        println!("Reduced damage percentage: {}%", reduced_damage_percentage);
        assert_eq!(reduced_damage_percentage, 80.0);
    }

    #[test]
    fn test_calculate_damage_reduction_with_no_special_ability() {
        let armor = Armor {
            name: String::from("Test Armor"),
            picture: String::from("test.png"),
            defense_stat: 20,
            special_ability: Some(0.0),
            description: Some(String::from("Test armor with  no special ability")),
            ability_type: Some(String::from("")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = PlayerStats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
            player_id: 1,
        };

        let incoming_damage = 100.0;

        let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, &player_stats);

        println!("Reduced damage: {}", reduced_damage);
        assert!(reduced_damage >= 20.0); // Damage should be at least 20% of incoming damage
    }

    #[test]
    fn test_calculate_damage_reduction_with_less_than_20_damage() {
        let armor = Armor {
            name: String::from("Test Armor"),
            picture: String::from("test.png"),
            defense_stat: 20,
            special_ability: Some(0.0),
            description: Some(String::from("Test armor with no special ability")),
            ability_type: Some(String::from("")),
            strength_scaling: Some(0.1),
            dexterity_scaling: Some(0.2),
            intelligence_scaling: Some(0.3),
            constitution_scaling: Some(0.4),
            luck_scaling: Some(0.5),
        };

        let player_stats = PlayerStats {
            strength: 10,
            dexterity: 20,
            intelligence: 30,
            constitution: 40,
            luck: 50,
            player_id: 1,
        };

        let incoming_damage = 9.0;

        let reduced_damage = calculate_damage_reduction(&armor, incoming_damage, &player_stats);

        let base_reduction = armor.defense_stat as f32;
        let strength_reduction =
            0.03 * armor.strength_scaling.unwrap_or(0.0) * player_stats.strength as f32;
        let dexterity_reduction =
            0.03 * armor.dexterity_scaling.unwrap_or(0.0) * player_stats.dexterity as f32;
        let intelligence_reduction =
            0.03 * armor.intelligence_scaling.unwrap_or(0.0) * player_stats.intelligence as f32;
        let constitution_reduction =
            0.03 * armor.constitution_scaling.unwrap_or(0.0) * player_stats.constitution as f32;
        let luck_reduction = 0.03 * armor.luck_scaling.unwrap_or(0.0) * player_stats.luck as f32;

        let total_scaling_reduction = strength_reduction
            + dexterity_reduction
            + intelligence_reduction
            + constitution_reduction
            + luck_reduction;
        let total_reduction = base_reduction + total_scaling_reduction;
        let final_reduction = (total_reduction + 0.0).min(50.0);

        let expected_damage =
            (0.2 * incoming_damage).max(incoming_damage * (1.0 - final_reduction / 100.0));
        println!("expected damage: {}", expected_damage);
        assert!((reduced_damage - expected_damage).abs() < 0.01); // Allowing small tolerance due to floating point precision
    }
}
