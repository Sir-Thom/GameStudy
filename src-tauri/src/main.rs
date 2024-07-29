// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_sql::{Migration, MigrationKind};
mod armor;

mod enemies;
mod player;
mod weapon;
use player::create_character;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    class_name TEXT NOT NULL,
    hp INTEGER NOT NULL,
    skills TEXT,
    inventory_id INTEGER,
    gold INTEGER NOT NULL DEFAULT 0,
    experience INTEGER NOT NULL DEFAULT 0,
    next_level_exp INTEGER NOT NULL DEFAULT 100,
    current_exp INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    weapon_id INTEGER REFERENCES weapons(id),  
    armor_id INTEGER REFERENCES armor(id),
    accessory TEXT,
    FOREIGN KEY (class_name) REFERENCES classes(name)    
);

CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    base_stats TEXT NOT NULL,
    skills TEXT,
    fire_resistance REAL DEFAULT 0.0,
    magic_resistance REAL DEFAULT 0.0,
    frost_resistance REAL DEFAULT 0.0,
    lightning_resistance REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS player_stats (
    player_id INTEGER PRIMARY KEY,
    strength INTEGER NOT NULL,
    dexterity INTEGER NOT NULL,
    intelligence INTEGER NOT NULL,
    constitution INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS armor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    picture TEXT NOT NULL,
    defense_stat INTEGER NOT NULL,
    description TEXT,
    special_ability TEXT, 
    special_ability_value REAL, 
    strength_scaling REAL DEFAULT 0, 
    dexterity_scaling REAL DEFAULT 0, 
    intelligence_scaling REAL DEFAULT 0, 
    constitution_scaling REAL DEFAULT 0, 
    luck_scaling REAL DEFAULT 0 
);

CREATE TABLE IF NOT EXISTS enemies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    hp INTEGER NOT NULL,
    attack INTEGER NOT NULL,
    defense INTEGER NOT NULL,
    abilities TEXT,
    image TEXT,
    experience_reward INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS weapons (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL, 
    damage_type TEXT NOT NULL,
    base_damage INTEGER NOT NULL,
    defense_provided INTEGER,
    description TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    item_id INTEGER ,
    quantity INTEGER  DEFAULT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

INSERT OR IGNORE INTO classes (name, base_stats, skills, fire_resistance, magic_resistance, frost_resistance, lightning_resistance) VALUES
    ('Warrior', '{\"strength\": 8, \"dexterity\": 4, \"intelligence\": 2, \"constitution\": 7, \"luck\": 3}', '[\"Sword Mastery\", \"Shield Bash\", \"Battle Cry\"]', 0.1, 0.05, 0.05, 0.1),
    ('Mage', '{\"strength\": 3, \"dexterity\": 4, \"intelligence\": 9, \"constitution\": 5, \"luck\": 4}', '[\"Fireball\", \"Ice Barrier\", \"Teleport\"]', 0.2, 0.1, 0.15, 0.05),
    ('Archer', '{\"strength\": 5, \"dexterity\": 8, \"intelligence\": 4, \"constitution\": 5, \"luck\": 5}', '[\"Precision Shot\", \"Evasive Maneuvers\", \"Marksmanship\"]', 0.05, 0.1, 0.1, 0.1),
    ('Rogue', '{\"strength\": 4, \"dexterity\": 7, \"intelligence\": 3, \"constitution\": 4, \"luck\": 6}', '[\"Stealth\", \"Backstab\", \"Evasion\"]', 0.05, 0.1, 0.1, 0.15);

INSERT OR IGNORE INTO weapons (name, type, damage_type, base_damage, defense_provided, description) VALUES
    ('Rusty Sword and Wooden Shield', 'SwordAndShield', 'Physical', 25, 30, 'A rusty sword and a wooden shield.'),
    ('Iron Dagger', 'Dagger', 'Physical', 18, NULL, 'A sharp iron dagger for quick strikes.'),
    ('Longbow', 'Bow', 'Physical', 22, NULL, 'A longbow for long-range attacks.'),
    ('Rusty GreatAxe', 'GreatAxe', 'Fire', 22, 25, 'A large axe with a rusty blade.'),
    ('Magic Staff', 'Staff', 'Magic', 18, NULL, 'A staff imbued with arcane energies.'),
    ('Steel Dagger', 'Dagger', 'Physical', 15, NULL, 'A sharp steel dagger for quick strikes.'),
    ('Ice Wand', 'Wand', 'Ice', 16, NULL, 'A wand that freezes enemies on contact.');

INSERT OR IGNORE INTO enemies (name, type, hp, attack, defense, abilities, image, experience_reward) VALUES
    ('Goblin', 'Creature', 30, 5, 2, '[\"Slash\", \"Quick Attack\"]', 'goblin.png', 10),
    ('Orc', 'Creature', 60, 10, 8, '[\"Smash\", \"Charge\"]', 'orc.png', 25),
    ('Skeleton Warrior', 'Undead', 45, 7, 4, '[\"Bone Shield\", \"Rattle Strike\"]', 'skeleton_warrior.png', 20),
    ('Dark Mage', 'Mage', 40, 8, 3, '[\"Fireball\", \"Dark Barrier\"]', 'dark_mage.png', 30),
    ('Dragon', 'Dragon', 120, 20, 15, '[\"Fire Breath\", \"Tail Swipe\"]', 'dragon.png', 50),
    ('Golem', 'Construct', 80, 12, 12, '[\"Rock Slam\", \"Earthquake\"]', 'golem.png', 40),
    ('Vampire Bat', 'Creature', 25, 6, 2, '[\"Bite\", \"Screech\"]', 'vampire_bat.png', 15),
    ('Troll', 'Creature', 70, 15, 10, '[\"Club Smash\", \"Regenerate\"]', 'troll.png', 35);

INSERT OR IGNORE INTO armor (name, picture, defense_stat, special_ability, special_ability_value, description, strength_scaling, dexterity_scaling, intelligence_scaling, constitution_scaling, luck_scaling) VALUES
    ('Iron Armor', 'iron_armor.png', 40, NULL, NULL, 'Standard iron armor offering decent protection.', 0.05, 0, 0, 0.1, 0),
    ('Steel Armor', 'steel_armor.png', 60, NULL, NULL, 'Sturdy steel armor with high defense.', 0.1, 0, 0, 0.15, 0),
    ('Mage Robes', 'mage_robes.png', 10, 'attack', 0.15, 'Robes that increase magic damage by 15%.', 0, 0, 0.2, 0, 0),
    ('Leather Armor', 'leather_armor.png', 25, NULL, NULL, 'Light and flexible leather armor.', 0, 0.1, 0, 0, 0.05),
    ('Dragon Scale Armor', 'dragon_scale_armor.png', 80, 'defense', 0.10, 'Armor made from dragon scales, increasing defense and providing a 10% damage reduction.', 0.2, 0, 0, 0.3, 0.1);
            ",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:character.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![create_character])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
