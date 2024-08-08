use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Weapon {
    pub id: i32,
    pub name: String,
    pub weapon_type: String,
    pub damage_type: String,
    pub base_damage: i32,
    pub defense_provided: i32,
    pub upgrade_level: i32,
    pub description: String,
    pub strength_scaling: Option<f32>,
    pub dexterity_scaling: Option<f32>,
    pub intelligence_scaling: Option<f32>,
    pub constitution_scaling: Option<f32>,
    pub luck_scaling: Option<f32>,
}
