pub mod quiz_info;
use quiz_info::save_quiz;

#[tauri::command(rename_all = "snake_case")]
pub fn save_quiz_cmd(app_dir_path:String,quiz_data: String,filename:String) -> Result<(),String> {
    save_quiz(app_dir_path,&quiz_data,filename)
}
