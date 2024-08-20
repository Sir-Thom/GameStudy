use super::armor_damage_negation::calculate_damage_reduction;
use crate::player::stats::PlayerStats;
use serde::{Deserialize, Serialize};
/// A struct representing the armor equipped by the player.
///
/// # Fields
/// * `name` - The name of the armor.
/// * `picture` - The image of the armor.
/// * `defense_stat` - The defense stat of the armor.
/// * `special_ability` - The special ability of the armor.
/// * `description` - The description of the armor.
/// * `ability_type` - The type of ability the armor has.It can be attack or defense
/// * `strength_scaling` - The scaling of the armor with strength.
/// * `dexterity_scaling` - The scaling of the armor with dexterity.
/// * `intelligence_scaling` - The scaling of the armor with intelligence.
/// * `constitution_scaling` - The scaling of the armor with constitution.
/// * `luck_scaling` - The scaling of the armor with luck.
#[derive(Serialize, Deserialize, Debug)]
pub struct Armor {
    pub name: String,
    pub picture: String,
    pub defense_stat: u32,
    pub special_ability_value: Option<f32>,
    pub description: Option<String>,
    pub special_ability: Option<String>,
    pub strength_scaling: Option<f32>,
    pub dexterity_scaling: Option<f32>,
    pub intelligence_scaling: Option<f32>,
    pub constitution_scaling: Option<f32>,
    pub luck_scaling: Option<f32>,
}

/// Get the damage reduction provided by the armor.
///
/// # Arguments
/// * `armor` - The armor equipped by the player.
/// * `incoming_damage` - The amount of damage dealt to the player.
/// * `player_stats` - The stats of the player.
///
/// # Returns
/// The amount of damage reduced by the armor.
pub fn get_armor_damage_reduction(
    armor: &Armor,
    incoming_damage: f32,
    player_stats: &PlayerStats,
) -> f32 {
    return calculate_damage_reduction(armor, incoming_damage, player_stats);
}

//TODO: Implement a method to allow armor to add bonus damage to the player's attack.
