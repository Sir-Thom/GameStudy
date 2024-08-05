use serde::{Deserialize, Serialize};

use crate::player::stats::PlayerResistances;

#[derive(Serialize, Deserialize, Debug)]
pub struct Enemies {
    pub name: String,
    pub hp: u32,
    pub base_attack: u32,
    pub fire_attack: u32,
    pub lightning_attack: u32,
    pub magic_attack: u32,
    pub frost_attack: u32,
    pub damage_scaling: f32,
    /*pub magic_defense: u32,
    pub fire_resistance: f32,
    pub magic_resistance: f32,
    pub frost_resistance: f32,
    pub lightning_resistance: f32,*/
    pub image: String,
    //pub difficulty: f32,
    //pub base_xp: u32,
    //pub base_gold: u32,
}

pub fn calculate_enemy_damage(
    enemy: &Enemies,
    player_resistances: &PlayerResistances,
    player_level: u32,
) -> f32 {
    let base_damage =
        enemy.base_attack as f32 * (1.0 + enemy.damage_scaling * (player_level as f32 / 10.0));

    let fire_damage = enemy.fire_attack as f32 * (1.0 - player_resistances.fire_resistance);
    let lightning_damage =
        enemy.lightning_attack as f32 * (1.0 - player_resistances.lightning_resistance);
    let magic_damage = enemy.magic_attack as f32 * (1.0 - player_resistances.magic_resistance);
    let frost_damage = enemy.frost_attack as f32 * (1.0 - player_resistances.frost_resistance);

    let total_damage = base_damage + fire_damage + lightning_damage + magic_damage + frost_damage;

    if total_damage < 0.0 {
        1.0
    } else {
        total_damage
    }
}
