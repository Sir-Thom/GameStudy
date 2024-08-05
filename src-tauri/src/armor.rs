pub mod armor_info;
use crate::player::stats::PlayerStats;
use armor_info::Armor;

pub fn calculate_damage_reduction(
    armor: &Armor,
    incoming_damage: f32,
    player_stats: &PlayerStats,
) -> f32 {
    // Base reduction from armor
    let base_reduction = armor.defense_stat as f32;

    // Scaling reductions
    let strength_reduction =
        0.05 * armor.strength_scaling.unwrap_or(0.0) * player_stats.strength as f32;
    let dexterity_reduction =
        0.05 * armor.dexterity_scaling.unwrap_or(0.0) * player_stats.dexterity as f32;
    let intelligence_reduction =
        0.05 * armor.intelligence_scaling.unwrap_or(0.0) * player_stats.intelligence as f32;
    let constitution_reduction =
        0.05 * armor.constitution_scaling.unwrap_or(0.0) * player_stats.constitution as f32;
    let luck_reduction = 0.05 * armor.luck_scaling.unwrap_or(0.0) * player_stats.luck as f32;

    let total_scaling_reduction = strength_reduction
        + dexterity_reduction
        + intelligence_reduction
        + constitution_reduction
        + luck_reduction;
    let total_reduction = base_reduction + total_scaling_reduction;

    // Special reduction from armor
    let special_reduction = match armor.ability_type.as_deref() {
        Some("defense") => armor.special_ability.unwrap_or(0.0),
        _ => 0.0,
    };

    let final_reduction = total_reduction + special_reduction;

    // Calculate the actual damage taken
    let damage_to_take = (incoming_damage - final_reduction).max(1.0); // Ensure damage is not less than 1.0

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
        assert!(reduced_damage >= 1.0);
    }
}
