use super::weapon_damage::calculate_weapon_damage;
use crate::{player::stats::PlayerStats, weapon::weapon_types::WeaponType};
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Debug)]
pub struct Weapon {
    pub id: i32,
    pub name: String,
    pub weapon_type: WeaponType,
    pub base_damage: u32,
    pub fire_damage: u32,
    pub lightning_damage: u32,
    pub magic_damage: u32,
    pub frost_damage: u32,
    pub defense_provided: i32,
    pub upgrade_level: i32,
    pub description: String,
    pub strength_scaling: Option<f32>,
    pub dexterity_scaling: Option<f32>,
    pub intelligence_scaling: Option<f32>,
    pub constitution_scaling: Option<f32>,
    pub luck_scaling: Option<f32>,
}

pub fn get_weapon_damage(weapon: &Weapon, player_stats: &PlayerStats) -> u32 {
    return calculate_weapon_damage(weapon, player_stats);
}

#[cfg(test)]
mod test {
    use super::*;
#[test]
fn test_get_weapon(){
    let test_weapon = Weapon{
        id:0,
        name: "".to_string(),
        weapon_type: WeaponType::SwordAndShield,
        base_damage: 0,
        fire_damage: 0,
        lightning_damage: 0,
        magic_damage: 0,
        frost_damage: 0,
        defense_provided: 0,
        upgrade_level: 0,
        description: "".to_string(),
        strength_scaling: None,
        dexterity_scaling: None,
        intelligence_scaling: None,
        constitution_scaling: None,
        luck_scaling: None,
        };
    assert_eq!(test_weapon.weapon_type.get_weapon_type(),WeaponType::SwordAndShield.get_weapon_type());
    }
#[test]
fn test_get_weapon_damage(){
     let test_weapon = Weapon{
        id:0,
        name: "".to_string(),
        weapon_type: WeaponType::SwordAndShield,
        base_damage: 0,
        fire_damage: 0,
        lightning_damage: 0,
        magic_damage: 0,
        frost_damage: 0,
        defense_provided: 0,
        upgrade_level: 0,
        description: "".to_string(),
        strength_scaling: None,
        dexterity_scaling: None,
        intelligence_scaling: None,
        constitution_scaling: None,
        luck_scaling: None,
        };
    let player_stats = PlayerStats {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        constitution: 10,
        luck: 10,
        player_id: 1, 
    };
    let damage = get_weapon_damage(&test_weapon, &player_stats);
    assert_eq!(damage, 0);
}
}
