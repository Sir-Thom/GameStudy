use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub(crate) enum WeaponType {
    SwordAndShield,
    GreatSword,
    Bow,
    GreatAxe,
    Staff,
    Wand,
    Dagger,
    Spear,
    GreatSpear,
    Hammer,
    Warhammer,
}

impl WeaponType {
    pub fn get_weapon_type(&self) -> &str {
        match self {
            WeaponType::SwordAndShield => "SwordAndShield",
            WeaponType::GreatSword => "GreatSword",
            WeaponType::Bow => "Bow",
            WeaponType::GreatAxe => "GreatAxe",
            WeaponType::Staff => "Staff",
            WeaponType::Wand => "Wand",
            WeaponType::Dagger => "Dagger",
            WeaponType::Spear => "Spear",
            WeaponType::GreatSpear => "GreatSpear",
            WeaponType::Hammer => "Hammer",
            WeaponType::Warhammer => "Warhammer",
        }
    }
}
