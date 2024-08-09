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
