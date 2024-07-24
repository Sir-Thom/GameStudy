use crate::character::stats::Stats;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, Debug)]
pub struct CharacterClass {
    pub name: String,
    pub base_stats: Stats,
    pub skills: Vec<String>,
}
