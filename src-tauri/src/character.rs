use character_info::Character;

pub mod character_info;
pub mod classes;
pub mod stats;

fn calculate_hp(constitution_score: u32, level: u32) -> Result<u32, String> {
    const BASE_HP: u32 = 100;
    const CONSTITUTION_BONUS_PER_POINT: u32 = 5; 
    const LEVEL_SCALING_FACTOR: u32 = 10; 


    let constitution_bonus = constitution_score * CONSTITUTION_BONUS_PER_POINT;

    let level_bonus = level * LEVEL_SCALING_FACTOR;


    let total_hp = BASE_HP
        .checked_add(constitution_bonus)
        .ok_or("Overflow occurred during Constitution bonus calculation")?
        .checked_add(level_bonus)
        .ok_or("Overflow occurred during Level scaling calculation")?;


    println!("Base HP: {}, Constitution Bonus: {}, Level Bonus: {}, Total HP: {}", 
             BASE_HP, constitution_bonus, level_bonus, total_hp);

    Ok(total_hp)
}
#[tauri::command]
pub fn create_character(character_data: String) -> Result<Character, String> {
    let mut character: Character = serde_json::from_str(&character_data)
        .map_err(|e| format!("Failed to parse character data: {}", e))?;
    println!("Received character data: {:?}", character);

    match calculate_hp(character.class.base_stats.constitution, character.level) {
        Ok(hp) => {
                        character.hp = hp;

            println!("Updated character with HP: {:?}", character);
            Ok(character)
        }
        Err(e) => {
            println!("Error creating character: {}", e);
            Err(e)
        }
    }
}

