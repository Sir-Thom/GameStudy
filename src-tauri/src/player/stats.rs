use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Stats {
    pub strength: u32,
    pub dexterity: u32,
    pub intelligence: u32,
    pub constitution: u32,
    pub luck: u32,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct PlayerStats {
    pub player_id: u32,
    pub strength: u32,
    pub dexterity: u32,
    pub intelligence: u32,
    pub constitution: u32,
    pub luck: u32,
}
#[derive(Serialize, Deserialize, Debug)]
pub struct PlayerResistances {
    pub player_id: u32,
    pub fire_resistance: f32,
    pub magic_resistance: f32,
    pub frost_resistance: f32,
    pub lightning_resistance: f32,
}
