// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_sql::{Migration,MigrationKind,Builder};
use serde::{Deserialize, Serialize};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
#[derive(Serialize, Deserialize, Debug)]
struct Character {
    name: String,
    level: u32,
    class: CharacterClass,
    hp: u32,
    skills: Vec<String>,
    inventory: Vec<String>,
    gold: u32,
    experience: u32,
    next_level_exp: u32,
    current_exp: u32,
    image: String,
    weapon: String,
    armor: String,
    shield: String,
    accessory: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct CharacterClass {
    name: String,
    base_stats: Stats,
    skills: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Stats {
    strength: u32,
    dexterity: u32,
    intelligence: u32,
    constitution: u32,
    luck: u32,
}
#[tauri::command()]
fn create_character(character_data: String) -> Result<String, String> {
    let character: Character = serde_json::from_str(&character_data)
        .map_err(|e| format!("Failed to parse character data: {}", e))?;
    println!("Received character data: {:?}", character);

    // Process character creation logic here

    Ok("Character created successfully!".to_string())
}
fn main() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        level INTEGER NOT NULL,
        class_id INTEGER NOT NULL REFERENCES character_classes(id),
        hp INTEGER NOT NULL,
        skills TEXT,
        inventory TEXT,
        gold INTEGER NOT NULL,
        experience INTEGER NOT NULL,
        next_level_exp INTEGER NOT NULL,
        current_exp INTEGER NOT NULL,
        image TEXT,
        weapon TEXT,
        armor TEXT,
        shield TEXT,
        accessory TEXT
        );
                CREATE TABLE IF NOT EXISTS character_classes (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    base_stats TEXT NOT NULL,
                    skills TEXT
                );

                INSERT OR IGNORE INTO character_classes (name, base_stats, skills) VALUES
                    ('Warrior', '{\"strength\": 8, \"dexterity\": 4, \"intelligence\": 2, \"constitution\": 7, \"luck\": 3}', '[\"Sword Mastery\", \"Shield Bash\", \"Battle Cry\"]');

                INSERT OR IGNORE INTO character_classes (name, base_stats, skills) VALUES
                    ('Mage', '{\"strength\": 3, \"dexterity\": 4, \"intelligence\": 9, \"constitution\": 5, \"luck\": 4}', '[\"Fireball\", \"Ice Barrier\", \"Teleport\"]');

                INSERT OR IGNORE INTO character_classes (name, base_stats, skills) VALUES
                    ('Archer', '{\"strength\": 5, \"dexterity\": 8, \"intelligence\": 4, \"constitution\": 5, \"luck\": 5}', '[\"Precision Shot\", \"Evasive Maneuvers\", \"Marksmanship\"]');

                INSERT OR IGNORE INTO character_classes (name, base_stats, skills) VALUES
                    ('Rogue', '{\"strength\": 4, \"dexterity\": 7, \"intelligence\": 3, \"constitution\": 4, \"luck\": 6}', '[\"Stealth\", \"Backstab\", \"Evasion\"]');
            
            CREATE TABLE weapons (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, 
    damage_type TEXT NOT NULL,
    base_damage INTEGER NOT NULL,
    defense_provided INTEGER,
    description TEXT
);

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Rusty Sword and Wooden Shield', 'SwordAndShield', 'Physical', 25, 30, 'A rusty sword and a wooden shield.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Rusty Sword and Wooden Shield' AND type = 'SwordAndShield');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Iron Dagger', 'Dagger', 'Physical', 18, NULL, 'A sharp iron dagger for quick strikes.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Iron Dagger' AND type = 'Dagger');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Longbow', 'Bow', 'Physical', 22, NULL, 'A longbow for long-range attacks.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Longbow' AND type = 'Bow');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Rusty GreatAxe', 'GreatAxe', 'Fire', 22, 25, 'A large axe with a rusty blade.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Rusty GreatAxe' AND type = 'GreatAxe');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Magic Staff', 'Staff', 'Magic', 18, NULL, 'A staff imbued with arcane energies.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Magic Staff' AND type = 'Staff');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Steel Dagger', 'Dagger', 'Physical', 15, NULL, 'A sharp steel dagger for quick strikes.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Steel Dagger' AND type = 'Dagger');

INSERT INTO weapons (name, type, damage_type, base_damage, defense_provided, description)
SELECT 'Ice Wand', 'Wand', 'Ice', 16, NULL, 'A wand that freezes enemies on contact.'
WHERE NOT EXISTS (SELECT 1 FROM weapons WHERE name = 'Ice Wand' AND type = 'Wand');
            "
            ,
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
