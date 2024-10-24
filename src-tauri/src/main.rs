// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_log::TimezoneStrategy::UseLocal;
use tauri_plugin_sql::{Migration, MigrationKind};
mod armor;
mod enemies;
mod player;
mod quiz;
mod weapon;

use armor::{armor_damage_attack_increase, calculate_damage_taken};
use enemies::{apply_damage_to_enemy, get_enemy_damage, get_enemy_damage_negation};
use player::{
    create_character, get_player_armor, get_player_hp, get_player_resistances, get_player_stats,
};
use quiz::{load_quiz_cmd, save_quiz_cmd,remove_quiz_cmd};
use weapon::calculate_damage_dealt;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let migrations = vec![
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
    description TEXT,
    base_stats TEXT NOT NULL,
    skills TEXT,
    fire_resistance REAL DEFAULT 0.0,
    magic_resistance REAL DEFAULT 0.0,
    frost_resistance REAL DEFAULT 0.0,
    lightning_resistance REAL DEFAULT 0.0,
    starting_weapon_id INTEGER REFERENCES weapons(id),
    starting_armor_id INTEGER REFERENCES armor(id)
);


CREATE TABLE IF NOT EXISTS player_stats (
    player_id INTEGER PRIMARY KEY,
    strength INTEGER NOT NULL,
    dexterity INTEGER NOT NULL,
    intelligence INTEGER NOT NULL,
    constitution INTEGER NOT NULL,
    luck INTEGER NOT NULL,
    fire_resistance REAL DEFAULT 0.0,
    magic_resistance REAL DEFAULT 0.0,
    frost_resistance REAL DEFAULT 0.0,
    lightning_resistance REAL DEFAULT 0.0,
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
    hp INTEGER NOT NULL,
    base_damage INTEGER NOT NULL,
    fire_damage INTEGER DEFAULT 0,
    lightning_damage INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    frost_damage INTEGER DEFAULT 0,
    damage_scaling REAL DEFAULT 0.0,
    defense_stat INTEGER NOT NULL,
    defense_scaling REAL DEFAULT 0.0,
    fire_resistance REAL DEFAULT 0.0,
    magic_resistance REAL DEFAULT 0.0,
    frost_resistance REAL DEFAULT 0.0,
    lightning_resistance REAL DEFAULT 0.0,
    abilities TEXT,
    image TEXT,
    experience_reward INTEGER NOT NULL,
    gold_reward INTEGER NOT NULL,
    min_level_encountered INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS weapons (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL, 
    upgrade_level INTEGER DEFAULT 0,
    base_damage INTEGER NOT NULL,
    fire_damage INTEGER DEFAULT 0,
    lightning_damage INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    frost_damage INTEGER DEFAULT 0,
    defense_provided INTEGER DEFAULT 0, 
    description TEXT,
    strength_scaling REAL DEFAULT 0,
    dexterity_scaling REAL DEFAULT 0,
    intelligence_scaling REAL DEFAULT 0,
    constitution_scaling REAL DEFAULT 0,
    luck_scaling REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    item_id INTEGER,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

INSERT OR IGNORE INTO weapons (name, weapon_type, base_damage, fire_damage, lightning_damage, magic_damage, frost_damage, defense_provided, description, strength_scaling, dexterity_scaling, intelligence_scaling, constitution_scaling, luck_scaling) VALUES
    ('Rusty Sword and Wooden Shield', 'SwordAndShield', 25, 0, 0, 0, 0, 30, 'A rusty sword and a wooden shield.', 0.1, 0.0, 0.0, 0.2, 0.0),
    ('Iron Dagger', 'Dagger', 18, 0, 0, 0, 0, 0, 'A sharp iron dagger for quick strikes.', 0.0, 0.5, 0.0, 0.0, 0.0),
    ('Longbow', 'Bow', 22, 0, 0, 0, 0, 0, 'A longbow for long-range attacks.', 0.0, 0.4, 0.0, 0.0, 0.1),
    ('Rusty GreatAxe', 'GreatAxe', 22, 10, 0, 0, 0, 25, 'A large axe with a rusty blade that deals some fire damage.', 0.6, 0.0, 0.0, 0.0, 0.0),
    ('Magic Staff', 'Staff', 18, 0, 0, 5, 0, 0, 'A staff imbued with arcane energies.', 0.0, 0.0, 0.7, 0.0, 0.0),
    ('Steel Dagger', 'Dagger', 15, 0, 0, 0, 0, 0, 'A sharp steel dagger for quick strikes.', 0.0, 0.4, 0.0, 0.0, 0.0),
    ('Ice Wand', 'Wand', 16, 0, 0, 0, 8, 0, 'A wand that freezes enemies on contact.', 0.0, 0.0, 0.6, 0.0, 0.0);


INSERT OR IGNORE INTO armor (name, picture, defense_stat, special_ability, special_ability_value, description, strength_scaling, dexterity_scaling, intelligence_scaling, constitution_scaling, luck_scaling) VALUES
    ('Iron Armor', 'iron_armor.png', 15, NULL, NULL, 'Standard iron armor offering decent protection.', 0.02, 0, 0, 0.05, 0),
    ('Steel Armor', 'steel_armor.png', 25, NULL, NULL, 'Sturdy steel armor with high defense.', 0.05, 0, 0, 0.1, 0),
    ('Mage Robes', 'mage_robes.png', 10, 'attack', 0.05, 'Robes that increase magic damage by 5%.', 0, 0, 0.1, 0, 0),
    ('Leather Armor', 'leather_armor.png', 10, NULL, NULL, 'Light and flexible leather armor.', 0, 0.05, 0, 0, 0.02),
    ('Dragon Scale Armor', 'dragon_scale_armor.png', 40, 'defense', 0.05, 'Armor made from dragon scales, increasing defense and providing a 5% damage reduction.', 0.1, 0, 0, 0.2, 0.05);

INSERT OR IGNORE INTO classes (name,description ,base_stats, skills, fire_resistance, magic_resistance, frost_resistance, lightning_resistance, starting_weapon_id, starting_armor_id) VALUES
    ('Warrior', 'Warriors are stalwart defenders, renowned for their unmatched prowess in battle. Armed with heavy armor and a trusty sword, they charge into the fray with sheer determination and strength. As the backbone of any adventuring party, their presence inspires courage and instills hope.' ,'{\"strength\": 8, \"dexterity\": 4, \"intelligence\": 2, \"constitution\": 7, \"luck\": 3}', '[\"Sword Mastery\", \"Shield Bash\", \"Battle Cry\"]', 0.1, 0.05, 0.05, 0.1, 1, 1),
    ('Mage','Mages wield the arcane arts with mastery and finesse. They use their knowledge of magic to manipulate the elements and conjure powerful spells. Though physically fragile, their spells can turn the tide of battle with devastating effects.' ,'{\"strength\": 3, \"dexterity\": 4, \"intelligence\": 9, \"constitution\": 5, \"luck\": 4}', '[\"Fireball\", \"Ice Barrier\", \"Teleport\"]', 0.2, 0.1, 0.15, 0.05, 5, 3),
    ('Archer', 'Archers are masters of precision and agility. With their keen eyesight and nimble movements, they strike from a distance with deadly accuracy. Their skill with a bow makes them invaluable for taking down enemies before they even reach the frontline.','{\"strength\": 5, \"dexterity\": 8, \"intelligence\": 4, \"constitution\": 5, \"luck\": 5}', '[\"Precision Shot\", \"Evasive Maneuvers\", \"Marksmanship\"]', 0.05, 0.1, 0.1, 0.1, 3, 4),
    ('Rogue', 'Rogues are cunning and elusive, experts in stealth and deception. They use their agility and guile to outmaneuver opponents and strike from the shadows. Their skills in stealth and trickery make them perfect for tasks that require subtlety and precision.','{\"strength\": 4, \"dexterity\": 7, \"intelligence\": 3, \"constitution\": 4, \"luck\": 6}', '[\"Stealth\", \"Backstab\", \"Evasion\"]', 0.05, 0.1, 0.1, 0.15, 6, 4);

INSERT OR IGNORE INTO enemies (
    name, hp, base_damage, fire_damage, lightning_damage, magic_damage, frost_damage,
    damage_scaling, defense_stat, defense_scaling, fire_resistance, magic_resistance,
    frost_resistance, lightning_resistance, min_level_encountered, abilities, image,
    experience_reward, gold_reward
) VALUES
    ('Goblin', 30, 10, 0, 0, 0, 0, 0.1, 2, 0.1, 0.0, 0.0, 0.0, 0.0, 1, '[\"Slash\", \"Quick Attack\"]', 'goblin.png', 10, 5),
    ('Orc', 60, 15, 0, 0, 0, 0, 0.2, 8, 0.2, 0.0, 0.0, 0.0, 0.0, 5, '[\"Smash\", \"Charge\"]', 'orc.png', 25, 15),
    ('Skeleton Warrior', 45, 12, 0, 0, 0, 0, 0.15, 4, 0.15, 0.0, 0.0, 0.0, 0.0, 3, '[\"Bone Shield\", \"Rattle Strike\"]', 'skeleton_warrior.png', 20, 10),
    ('Dark Mage', 40, 5, 0, 0, 20, 0, 0.25, 3, 0.2, 0.0, 0.25, 0.0, 0.0, 10, '[\"Fireball\", \"Dark Barrier\"]', 'dark_mage.png', 30, 20),
    ('Dragon', 120, 25, 15, 10, 12, 10, 0.3, 15, 0.25, 0.3, 0.0, 0.0, 0.0, 15, '[\"Fire Breath\", \"Tail Swipe\"]', 'dragon.png', 50, 50),
    ('Golem', 80, 20, 0, 0, 0, 0, 0.2, 12, 0.2, 0.0, 0.0, 0.0, 0.0, 10, '[\"Rock Slam\", \"Earthquake\"]', 'golem.png', 40, 25),
    ('Vampire Bat', 25, 8, 0, 0, 0, 0, 0.1, 2, 0.1, 0.0, 0.0, 0.0, 0.0, 2, '[\"Bite\", \"Screech\"]', 'vampire_bat.png', 15, 8),
    ('Troll', 70, 18, 0, 0, 0, 0, 0.2, 10, 0.2, 0.0, 0.0, 0.0, 0.0, 8, '[\"Club Smash\", \"Regenerate\"]', 'troll.png', 35, 20),
    ('Goblin Warrior', 40, 15, 0, 0, 0, 0, 0.1, 5, 0.1, 0.0, 0.0, 0.0, 0.0, 3, '[\"Charge\", \"Stomp\"]', 'goblin_warrior.png', 20, 10),
    ('Shadow Assassin', 50, 20, 0, 0, 0, 0, 0.2, 6, 0.15, 0.0, 0.0, 0.0, 0.0, 7, '[\"Backstab\", \"Shadow Strike\"]', 'shadow_assassin.png', 25, 15),
    ('Fire Demon', 80, 25, 15, 0, 0, 0, 0.3, 8, 0.2, 0.3, 0.0, 0.0, 0.0, 8, '[\"Fire Claw\", \"Inferno\"]', 'fire_demon.png', 40, 20),
    ('Frost Giant', 100, 30, 0, 0, 0, 20, 0.25, 10, 0.25, 0.0, 0.0, 0.25, 0.0, 10, '[\"Ice Smash\", \"Frost Breath\"]', 'frost_giant.png', 50, 30);
",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |_app| {
            // allowed the given directory
     

            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:character.db", migrations)
                .build(),
        )
        .plugin(
            tauri_plugin_log::Builder::new()
                .timezone_strategy(UseLocal)
                .level_for("sqlx", log::LevelFilter::Error)
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![
            create_character,
            get_player_armor,
            get_player_stats,
            calculate_damage_taken,
            get_player_resistances,
            get_enemy_damage,
            apply_damage_to_enemy,
            get_enemy_damage_negation,
            get_player_hp,
            calculate_damage_dealt,
            armor_damage_attack_increase,
            save_quiz_cmd,
            load_quiz_cmd,
            remove_quiz_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
