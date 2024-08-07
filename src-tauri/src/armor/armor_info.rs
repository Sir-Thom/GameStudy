use super::armor_damage_negation::calculate_damage_reduction;
use crate::player::stats::PlayerStats;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Armor {
    pub name: String,
    pub picture: String,
    pub defense_stat: i32,
    pub special_ability: Option<f32>,
    pub description: Option<String>,
    pub ability_type: Option<String>,
    pub strength_scaling: Option<f32>,
    pub dexterity_scaling: Option<f32>,
    pub intelligence_scaling: Option<f32>,
    pub constitution_scaling: Option<f32>,
    pub luck_scaling: Option<f32>,
}

pub fn get_armor_damage_reduction(
    armor: &Armor,
    incoming_damage: f32,
    player_stats: &PlayerStats,
) -> f32 {
    return calculate_damage_reduction(armor, incoming_damage, player_stats);
}
