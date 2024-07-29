use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Enemies {
    pub name: String,
    pub level: u32,
    pub hp: u32,
    pub attack: u32,
    pub defense: u32,
    pub magic_attack: u32,
    pub magic_defense: u32,
    pub fire_resistance: f32,
    pub magic_resistance: f32,
    pub frost_resistance: f32,
    pub lightning_resistance: f32,
    pub image: String,
    pub experience: u32,
    pub gold: u32,
    pub item_id: i32,
}
