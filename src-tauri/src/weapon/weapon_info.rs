use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Weapon {
    pub id: i32,
    pub name: String,
    pub weapon_type: String,
    pub damage_type: String,
    pub base_damage: i32,
    pub defense_provided: i32,
    pub description: String,
}
