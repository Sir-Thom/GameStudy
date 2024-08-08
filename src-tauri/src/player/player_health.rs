///calculate_hp calculates the total HP of a player based on their Constitution score and level.This function is only used internally and is not exposed to the frontend.
/// # Arguments
/// * `constitution_score` - The player's Constitution score.
/// * `level` - The player's level.
/// # Returns
/// The player's total HP.
pub(super) fn calculate_hp(constitution_score: u32, level: u32) -> Result<u32, String> {
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

    println!(
        "Base HP: {}, Constitution Bonus: {}, Level Bonus: {}, Total HP: {}",
        BASE_HP, constitution_bonus, level_bonus, total_hp
    );

    Ok(total_hp)
}
