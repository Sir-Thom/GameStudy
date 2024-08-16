use bincode;
use bincode::Options;
use crypto::buffer::{self, ReadBuffer, WriteBuffer};
use crypto::{aes, aes::KeySize, blockmodes};
use dotenv::dotenv;
use flate2;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{Cursor, Read, Write};
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
    let mut encryptor = aes::cbc_encryptor(KeySize::KeySize256, key, &iv, blockmodes::PkcsPadding);
    let mut final_result = Vec::<u8>::new();
    let mut read_buffer = buffer::RefReadBuffer::new(&data);
    let mut buffer = [0; 4096];
    let mut write_buffer = buffer::RefWriteBuffer::new(&mut buffer);
    loop {
        let result = encryptor
            .encrypt(&mut read_buffer, &mut write_buffer, true)
            .unwrap();
        final_result.extend(
            write_buffer
                .take_read_buffer()
                .take_remaining()
                .iter()
                .map(|&i| i),
        );
        match result {
            buffer::BufferResult::BufferUnderflow => break,
            buffer::BufferResult::BufferOverflow => {}
        }
    }
    final_result
}

fn compress_data(input: Vec<u8>) -> Vec<u8> {
    println!("Original size: {} bytes", input.len());
    let mut encoder = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::default());
    encoder.write_all(&input).expect("Failed to compress data");
    let compressed_data = encoder.finish().expect("Failed to finish compression");
    println!("Compressed size: {} bytes", compressed_data.len());
    compressed_data
}

fn decompress_data(input: Vec<u8>) -> Vec<u8> {
    let mut decoder = flate2::read::ZlibDecoder::new(Cursor::new(input));
    let mut decompressed_data = Vec::new();
    decoder
        .read_to_end(&mut decompressed_data)
        .expect("Failed to decompress data");
    println!("Decompressed size: {} bytes", decompressed_data.len());
    decompressed_data
}

/// Decrypt .quiz file
///
/// # Arguments
/// * `input` - the file data to decrypt
///
/// # Returns
/// the decrypted data
///
fn decrypt(input: &[u8]) -> Vec<u8> {
    dotenv().ok().expect("Failed to read .env file");
    let key: [u8; 32] = get_key_from_env();
    let iv = [0u8; 16];
    let mut decryptor = aes::cbc_decryptor(KeySize::KeySize256, &key, &iv, blockmodes::PkcsPadding);
    let mut final_result = Vec::<u8>::new();
    let mut read_buffer = buffer::RefReadBuffer::new(input);
    let mut buffer = [0; 4096];
    let mut write_buffer = buffer::RefWriteBuffer::new(&mut buffer);
    loop {
        let result = decryptor
            .decrypt(&mut read_buffer, &mut write_buffer, true)
            .unwrap();
        final_result.extend(
            write_buffer
                .take_read_buffer()
                .take_remaining()
                .iter()
                .map(|&i| i),
        );
        match result {
            buffer::BufferResult::BufferUnderflow => break,
            buffer::BufferResult::BufferOverflow => {}
        }
    }
    final_result 
}

pub fn save_quiz(app_dir_path: String, quiz: &Quiz, filename: String) -> Result<(), String> {
    let app_folder: &Path = Path::new(&app_dir_path);
    let mut path = PathBuf::new();
    path.push(app_folder);
    let quiz_file = path.join(filename + ".quiz");
    let hash_file: u64 = hash(
        &bincode::options()
            .with_little_endian()
            .serialize(&quiz)
            .unwrap(),
    );
    println!("Hash: {}", hash_file);

    if quiz_file.exists() {
        let binary_data =
            fs::read(&quiz_file).map_err(|e| format!("Failed to read quiz data: {}", e))?;
        let decompressed_data = decompress_data(binary_data);
        let old_hash = hash(&decompressed_data);
        println!("Old Hash: {}", old_hash);
        if old_hash == hash_file {
            return Ok(());
        }
    }

    let serialized_data = bincode::options()
        .with_little_endian()
        .serialize(&quiz)
        .map_err(|e| format!("Failed to serialize quiz data: {}", e))?;
    let compressed_data = compress_data(serialized_data);
    let encrypted_data = encrypt(compressed_data);
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

    let binary_data =
        fs::read(&quiz_file).map_err(|e| format!("Failed to read quiz data: {}", e))?;
    let decrypted_data = decrypt(&binary_data);
    let decompressed_data = decompress_data(decrypted_data);
    let cursor = Cursor::new(decompressed_data);
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
    fn test_encryption() {
        let input = "test".as_bytes().to_vec();
        let encrypt_input = encrypt(input.clone());
        assert_ne!(input, encrypt_input)
    }

    #[test]
    fn test_decryption() {
        let input = "test".as_bytes().to_vec();
        let encrypt_input = encrypt(input.clone());
        let decrypt_input = decrypt(&encrypt_input);
        assert_eq!(input, decrypt_input)
    }

    #[test]
    fn test_not_equal_hash() {
        let input = "test".as_bytes().to_vec();
        let hash = hash(&input);
        assert_ne!(hash, 0)
    }
    #[test]
    fn test_equal_hash() {
        let input = "test".as_bytes().to_vec();
        let hash_of_input = hash(&input);
        let input2 = "test".as_bytes().to_vec();
        let hash_of_input2 = hash(&input2);
        assert_eq!(hash_of_input, hash_of_input2)
    }

    #[test]
    fn test_equal_hash_different_data() {
        let input = "test".as_bytes().to_vec();
        let hash_of_input = hash(&input);
        let input2 = "test2".as_bytes().to_vec();
        let hash_of_input2 = hash(&input2);
        assert_ne!(hash_of_input, hash_of_input2)
    }
}
