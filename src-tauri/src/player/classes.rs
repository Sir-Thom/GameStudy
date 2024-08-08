use super::stats::Stats;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Classes {
    pub name: String,
    pub base_stats: Stats,
    pub skills: String,
    pub fire_resistance: f32,
    pub magic_resistance: f32,
    pub frost_resistance: f32,
    pub lightning_resistance: f32,
    pub starting_weapon_id: i32,
    pub starting_armor_id: i32,
}
