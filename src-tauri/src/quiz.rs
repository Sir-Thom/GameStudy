pub mod quiz_info;
use quiz_info::{load_quizz, save_quiz, Quiz};

#[tauri::command(rename_all = "snake_case")]
pub fn save_quiz_cmd(
    app_dir_path: String,
    quiz_data: Quiz,
    filename: String,
) -> Result<(), String> {
    save_quiz(app_dir_path, &quiz_data, &filename)
}

#[tauri::command(rename_all = "snake_case")]
pub fn load_quiz_cmd(app_dir_path: String, filename: String) -> Result<Quiz, String> {
    load_quizz(app_dir_path, filename)
}
