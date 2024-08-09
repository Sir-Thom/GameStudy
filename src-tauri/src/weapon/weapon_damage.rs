use crate::player::stats::PlayerStats;
use crate::weapon::weapon_info::Weapon;

pub(super) fn calculate_weapon_damage(weapon: &Weapon, player_stats: &PlayerStats) -> u32 {
    let mut total_damage = weapon.base_damage;
    println!("Base damage: {:?}", total_damage);

    let elemental_damage =
        weapon.fire_damage + weapon.lightning_damage + weapon.magic_damage + weapon.frost_damage;

    total_damage += elemental_damage;

    total_damage += apply_stat_scaling(weapon, player_stats);

    println!("Total damage: {:?}", total_damage);
    total_damage
}

fn apply_stat_scaling(weapon: &Weapon, player_stats: &PlayerStats) -> u32 {
    let mut scaled_damage = 0;

    if let Some(str_scaling) = weapon.strength_scaling {
        scaled_damage += scale_damage(player_stats.strength, str_scaling);
    }
    if let Some(dex_scaling) = weapon.dexterity_scaling {
        scaled_damage += scale_damage(player_stats.dexterity, dex_scaling);
    }
    if let Some(int_scaling) = weapon.intelligence_scaling {
        scaled_damage += scale_damage(player_stats.intelligence, int_scaling);
    }
    if let Some(con_scaling) = weapon.constitution_scaling {
        scaled_damage += scale_damage(player_stats.constitution, con_scaling);
    }
    if let Some(luck_scaling) = weapon.luck_scaling {
        scaled_damage += scale_damage(player_stats.luck, luck_scaling);
    }

    scaled_damage
}

fn scale_damage(stat_value: u32, scaling_factor: f32) -> u32 {
    (stat_value as f32 * scaling_factor).round() as u32
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::weapon::weapon_types::WeaponType;

    #[test]
    fn test_scale_damage() {
        assert_eq!(scale_damage(10, 0.5), 5);
        assert_eq!(scale_damage(10, 1.5), 15);
        assert_eq!(scale_damage(10, 0.0), 0);
    }

    #[test]
    fn test_scale_damage_with_negative_values() {
        assert_eq!(scale_damage(10, -0.5), 0);
        assert_eq!(scale_damage(10, -1.5), 0);
    }

    #[test]
    fn test_apply_stat_scaling() {
        let weapon = Weapon {
            id: 1,
            name: "Test Weapon".to_string(),
            weapon_type: WeaponType::SwordAndShield,
            base_damage: 10,
            fire_damage: 0,
            lightning_damage: 0,
            magic_damage: 0,
            frost_damage: 0,
            defense_provided: 0,
            upgrade_level: 0,
            description: "Test Weapon".to_string(),
            strength_scaling: Some(0.5),
            dexterity_scaling: Some(0.0),
            intelligence_scaling: Some(0.0),
            constitution_scaling: Some(0.0),
            luck_scaling: Some(0.0),
        };

        let player_stats = PlayerStats {
            player_id: 0,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            constitution: 10,
            luck: 10,
        };

        assert_eq!(apply_stat_scaling(&weapon, &player_stats), 5);
    }

    #[test]
    fn test_weapon_damage() {
        let weapon = Weapon {
            id: 1,
            name: "Test Weapon".to_string(),
            weapon_type: WeaponType::SwordAndShield,
            base_damage: 10,
            fire_damage: 0,
            lightning_damage: 0,
            magic_damage: 0,
            frost_damage: 0,

            defense_provided: 0,
            upgrade_level: 0,
            description: "Test Weapon".to_string(),
            strength_scaling: Some(0.5),
            dexterity_scaling: Some(0.0),
            intelligence_scaling: Some(0.0),
            constitution_scaling: Some(0.0),
            luck_scaling: Some(0.0),
        };

        let player_stats = PlayerStats {
            player_id: 0,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            constitution: 10,
            luck: 10,
        };
        println!(
            "scaled weapon damage {:?}",
            calculate_weapon_damage(&weapon, &player_stats)
        );
        assert_eq!(calculate_weapon_damage(&weapon, &player_stats), 15);
    }
}
