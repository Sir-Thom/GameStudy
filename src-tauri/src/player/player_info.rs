use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Player {
    pub name: String,
    pub level: u32,
    pub class_name: String,
    pub hp: u32,
    pub skills: Vec<String>,
    pub inventory: Vec<String>,
    pub gold: u32,
    pub experience: u32,
    pub next_level_exp: u32,
    pub current_exp: u32,
    pub image: String,
    pub weapon_id: i32,
    pub armor_id: i32,
    pub accessory: String,
}
