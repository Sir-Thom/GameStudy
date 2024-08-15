use bincode::Options;
use serde::{Serialize,Deserialize};
use std::borrow::Borrow;
use std::{clone, fs, path};
use std::path::{Path, PathBuf};

use tauri::path::{BaseDirectory, BaseDirectory::AppData}; // Import the app_data_dir function

#[derive(Serialize,Deserialize)]
pub struct Quiz {
    quiz_title: String,
    questions: Vec<Question>,
}

#[derive(Serialize,Deserialize)]
pub struct Question {
    question_text: String,
    answer_type:String,
    single_answer:Option<String>,
    choices:Option<Vec<Choice>>,
}

#[derive(Serialize,Deserialize)]
pub struct Choice {
    text: String,
    correct:bool,
}

pub fn save_quiz(app_dir_path:String,quiz_data: &str,filename:String) -> Result<(),String> {
    let app_folder = Path::new(&app_dir_path);
    // put it in pathBuf
    let mut path = PathBuf::new();
    path.push(app_folder);

  
    // make the bin name be automatically and not hard coded
    let pathLoc = path.join(filename+".quiz");


    println!("Saving quiz data to path: {:?}", path);
    print!("path: {:?}",path);
    let binary_data = bincode::serialize(&quiz_data)
        .map_err(|e| format!("failed to serialize quiz data: {}",e))?;
    fs::write(pathLoc, binary_data)
        .map_err(|e| format!("Failed to save quiz data: {}",e))?;
    Ok(())
}

