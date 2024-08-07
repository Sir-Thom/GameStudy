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
    pub abilities: Vec<String>,
    /*pub magic_defense: u32,
    pub fire_resistance: f32,
    pub magic_resistance: f32,
    pub frost_resistance: f32,
    pub lightning_resistance: f32,*/
    pub image: String,
    pub experience_reward: u32,
    pub gold_reward: u32,
}

impl Enemies {
    pub fn take_damage(&mut self, damage: f32) -> bool {
        let new_hp = self.hp as f32 - damage;
        self.hp = new_hp.max(0.0) as u32; // Ensure HP doesn't go below 0

        if self.hp == 0 {
            println!("Enemy {} has died.", self.name);
            true // Enemy is dead
        } else {
            false // Enemy is still alive
        }
    }
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

pub fn calculate_enemy_drops(enemy: &Enemies, player_level: u32) -> (u32, u32) {
    let xp_drop = (enemy.experience_reward as f32 * (1.0 + (player_level as f32 / 10.0))) as u32;
    let gold_drop = (enemy.gold_reward as f32 * (1.0 + (player_level as f32 / 10.0))) as u32;

    (xp_drop, gold_drop)
}
