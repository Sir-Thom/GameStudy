use serde::{Deserialize, Serialize};

use super::player_health::calculate_hp;

#[derive(Serialize, Deserialize, Debug)]
pub struct Player {
    pub name: String,
    pub level: u32,
    pub class_name: String,
    pub hp: u32,
    pub skills: Vec<String>,
    pub inventory_id: i32,
    pub gold: u32,
    pub experience: u32,
    pub next_level_exp: u32,
    pub current_exp: u32,
    pub image: String,
    pub weapon_id: i32,
    pub armor_id: i32,
    pub accessory: String,
}

pub fn player_hp(constitution: u32, level: u32) -> Result<u32, String> {
    let hp = calculate_hp(constitution, level)?;
    Ok(hp)
}
