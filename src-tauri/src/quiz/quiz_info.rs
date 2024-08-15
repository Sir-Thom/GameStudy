use bincode;
use bincode::Options;
use crypto::{aes,aes::KeySize, blockmodes};
use dotenv::dotenv;
use crypto::buffer::{self, ReadBuffer, WriteBuffer};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};


#[derive(Serialize, Deserialize, Debug)]
pub struct Quiz {
    pub quiz_title: String,
    pub questions: Vec<Question>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Question {
    pub question_text: String,
    pub answer_type: String,
    pub single_answer: Option<String>,
    pub choices: Option<Vec<Choice>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Choice {
    pub text: String,
    pub correct: bool,
}

fn hash(input: &[u8]) -> u64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish()
}

/// Get the Key for the .quiz file from .env
///
/// # Returns
/// the key for encrytption of the custom binary file .quiz
fn get_key_from_env() -> [u8; 32] {
    let key_str = dotenv::var("KEY_BIN_ENCRYPTION").expect("KEY_BIN_ENCRYPTION must be set");
    let mut key = [0u8; 32];
    
    let key_bytes = key_str.as_bytes();
    if key_bytes.len() == 32 {
        key.copy_from_slice(key_bytes);
    } else if key_bytes.len() > 32 {
        key.copy_from_slice(&key_bytes[..32]);
    } else {
        key[..key_bytes.len()].copy_from_slice(key_bytes);
    }
    
    key
}
/// Encrypt .quiz file 
///
/// # Arguments
/// * `input` - the file data to encrypt
///
/// # Returns
/// the encrypted data
fn encrypt(input: Vec<u8>) -> Vec<u8> {
    dotenv::dotenv().expect("Failed to find .env file");
    let key: &[u8; 32] = &get_key_from_env();
    let iv = [0u8; 16];
    let data = input;
    let mut encryptor = aes::cbc_encryptor( KeySize::KeySize256, key, &iv, blockmodes::PkcsPadding);
    let mut final_result = Vec::<u8>::new();
    let mut read_buffer = buffer::RefReadBuffer::new(&data);
    let mut buffer = [0; 4096];
    let mut write_buffer = buffer::RefWriteBuffer::new(&mut buffer);
    loop {
        let result = encryptor.encrypt(&mut read_buffer, &mut write_buffer, true).unwrap();
        final_result.extend(write_buffer.take_read_buffer().take_remaining().iter().map(|&i| i));
        match result {
            buffer::BufferResult::BufferUnderflow => break,
            buffer::BufferResult::BufferOverflow => { }
        }
    }
    final_result
}

fn decrypt(input: &[u8]) -> String {
    dotenv().ok().expect("Failed to read .env file");
    let key: [u8; 32] = get_key_from_env();
    let iv = [0u8; 16];
    let mut decryptor = aes::cbc_decryptor( KeySize::KeySize256, &key, &iv, blockmodes::PkcsPadding);
    let mut final_result = Vec::<u8>::new();
    let mut read_buffer = buffer::RefReadBuffer::new(input);
    let mut buffer = [0; 4096];
    let mut write_buffer = buffer::RefWriteBuffer::new(&mut buffer);
    loop {
        let result = decryptor.decrypt(&mut read_buffer, &mut write_buffer, true).unwrap();
        final_result.extend(write_buffer.take_read_buffer().take_remaining().iter().map(|&i| i));
        match result {
            buffer::BufferResult::BufferUnderflow => break,
            buffer::BufferResult::BufferOverflow => { }
        }
    }
    String::from_utf8(final_result).unwrap()
}

pub fn save_quiz(app_dir_path: String, quiz: &Quiz, filename: String) -> Result<(), String> {
    let app_folder: &Path = Path::new(&app_dir_path);
    let mut path = PathBuf::new();
    path.push(app_folder);
    let quiz_file = path.join(filename + ".quiz");
    let  hash_file: u64 = hash(&bincode::options().with_little_endian().serialize(&quiz).unwrap());
    println!("Hash: {}", hash_file);

    if quiz_file.exists() {
        let binary_data = fs::read(&quiz_file)
            .map_err(|e| format!("Failed to read quiz data: {}", e))?;
   
        let old_hash = hash(&binary_data);
        println!("Old Hash: {}", old_hash);
        if old_hash == hash_file {
            return Ok(());
        }
    }

    let serialized_data = bincode::options()
        .with_little_endian()
        .serialize(&quiz)
        .map_err(|e| format!("Failed to serialize quiz data: {}", e))?;
    let encrypted_data = encrypt(serialized_data);
    fs::write(&quiz_file, &encrypted_data)
        .map_err(|e| format!("Failed to write quiz data: {}", e))?;

    Ok(())
}

pub fn load_quizz(app_dir_path: String, filename: String) -> Result<Quiz, String> {
    let app_folder_path: &Path = Path::new(&app_dir_path);
    let mut path = PathBuf::new();
    path.push(app_folder_path);
    let quiz_file = path.join(filename + ".quiz");

    if !quiz_file.exists() {
        return Err("File does not exist".to_string());
    }

    let binary_data = fs::read(&quiz_file)
        .map_err(|e| format!("Failed to read quiz data: {}", e))?;
    let decrypted_data = decrypt(&binary_data);
    let cursor = Cursor::new(&decrypted_data);
    let quiz: Quiz = bincode::options()
        .with_little_endian()
        .deserialize_from(cursor)
        .map_err(|e| format!("Failed to deserialize quiz data: {}", e))?;
    println!("Loaded quiz: {:?}", quiz);

    Ok(quiz)
}

#[cfg(test)]
mod test {

    use super::*;

    #[test]
    fn test_encryption(){
        let input = "test".as_bytes().to_vec();
        let  encrypt_input = encrypt(input.clone());
        println!("{:?}",input);
        println!("{:?}",encrypt_input);
        assert_ne!(input,encrypt_input)
    }
}
