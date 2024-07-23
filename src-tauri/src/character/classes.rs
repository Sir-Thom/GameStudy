use serde::{Deserialize, Serialize};
use crate::character::stats::Stats;
#[derive(Serialize, Deserialize, Debug)]
pub struct CharacterClass {
    pub name: String,
    pub base_stats: Stats,
    pub skills: Vec<String>,
}

