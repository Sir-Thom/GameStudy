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
