use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::aead::Aead;
use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use bincode;
use bincode::Options;
use flate2;

use rand::Rng;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs;
use std::io::{Cursor, Read, Write};
use std::path::Path;
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
fn encrypt(input: Vec<u8>) -> Result<Vec<u8>, Box<dyn Error>> {
    // Retrieve the key from the environment
    let key_bytes = get_key_from_env();

    // Convert key bytes to a `GenericArray`
    let key = GenericArray::from_slice(&key_bytes);

    // Create an AES-256-GCM cipher instance
    let cipher = Aes256Gcm::new(key);

    // Generate a random nonce (12 bytes for AES-GCM)
    let mut nonce = [0u8; 12];
    rand::thread_rng().fill(&mut nonce);
    let nonce = Nonce::from_slice(&nonce);

    // Perform encryption
    let ciphertext = cipher
        .encrypt(nonce, input.as_ref())
        .map_err(|_| -> Box<dyn Error> { "Encryption failed".to_string().into() })?;

    // Combine nonce and ciphertext
    let mut result = Vec::new();
    result.extend_from_slice(&nonce);
    result.extend_from_slice(&ciphertext);

    Ok(result)
}

fn compress_data(input: Vec<u8>) -> Vec<u8> {
    log::debug!("Original size: {} bytes", input.len());
    let mut encoder = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::best());
    encoder.write_all(&input).expect("Failed to compress data");
    let compressed_data = encoder.finish().expect("Failed to finish compression");
    log::debug!("Compressed size: {} bytes", compressed_data.len());
    compressed_data
}

fn decompress_data(input: Vec<u8>) -> Vec<u8> {
    let mut decoder = flate2::read::ZlibDecoder::new(Cursor::new(input));
    let mut decompressed_data = Vec::new();
    decoder
        .read_to_end(&mut decompressed_data)
        .expect("Failed to decompress data");
    log::debug!("Decompressed size: {} bytes", decompressed_data.len());
    decompressed_data
}

/// Decrypt .quiz file
///
/// # Arguments
/// * `input` - the file data to decrypt
///
/// # Returns
/// A `Result` containing the decrypted data on success, or an error message on failure.
fn decrypt(input: &[u8]) -> Result<Vec<u8>, Box<dyn Error>> {
    let key_bytes = get_key_from_env();

    let key = GenericArray::from_slice(&key_bytes);

    let cipher = Aes256Gcm::new(key);

    if input.len() < 12 {
        return Err("Input data is too short".into());
    }

    let nonce = Nonce::from_slice(&input[..12]);
    let ciphertext = &input[12..];

    let decrypted_data = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| -> Box<dyn Error> { "Decryption failed".into() })?;

    Ok(decrypted_data)
}

pub fn save_quiz(app_dir_path: String, quiz: &Quiz, filename: &str) -> Result<(), String> {
    let app_folder: &Path = Path::new(&app_dir_path);
    let quiz_file = app_folder.join(filename.to_owned() + ".quiz");

    let serialized_data = bincode::options()
        .with_little_endian()
        .serialize(quiz)
        .map_err(|e| format!("Failed to serialize quiz data: {}", e))?;

    let hash_value = hash(&serialized_data);
    log::debug!("Computed hash before compression: {}", hash_value);

    let filename_clone: &str = &filename;
    if let Ok(quiz) = load_quizz(app_dir_path.clone(), filename_clone.to_owned() + ".quiz") {
        let stored_hash = hash(
            &bincode::options()
                .with_little_endian()
                .serialize(&quiz)
                .unwrap(),
        );
        if stored_hash == hash_value {
            return Ok(());
        }
    }

    let compressed_data = compress_data(serialized_data);
    log::debug!("Compressed data size: {} bytes", compressed_data.len());

    let encrypted_data =
        encrypt(compressed_data).map_err(|e| format!("Failed to encrypt data: {}", e))?;
    log::debug!("Encrypted data size: {} bytes", encrypted_data.len());

    let mut result = Vec::new();
    result.extend_from_slice(&encrypted_data);
    result.extend_from_slice(&hash_value.to_le_bytes());

    fs::write(&quiz_file, result).map_err(|e| format!("Failed to write quiz data: {}", e))?;

    Ok(())
}

pub fn load_quizz(app_dir_path: String, filename: String) -> Result<Quiz, String> {
    let app_folder_path: &Path = Path::new(&app_dir_path);
    let quiz_file = app_folder_path.join(filename);

    if !quiz_file.exists() {
        return Err("File does not exist".to_string());
    }

    let binary_data =
        fs::read(&quiz_file).map_err(|e| format!("Failed to read quiz data: {}", e))?;
    log::debug!("Read data size: {} bytes", binary_data.len());

    if binary_data.len() < 8 {
        return Err("File is too short to contain hash".to_string());
    }

    let (encrypted_data, hash_bytes) = binary_data.split_at(binary_data.len() - 8);
    let stored_hash = u64::from_le_bytes(hash_bytes.try_into().unwrap());
    log::debug!("Stored hash: {}", stored_hash);

    let decrypted_data = decrypt(encrypted_data).map_err(|e| e.to_string())?;

    let decompressed_data = decompress_data(decrypted_data);
    log::debug!("Decompressed data size: {} bytes", decompressed_data.len());

    let computed_hash = hash(&decompressed_data);
    log::debug!("Computed hash after decompression: {}", computed_hash);

    if computed_hash != stored_hash {
        return Err("File has been modified or corrupted".to_string());
    }
    log::info!("File loaded successfully");

    let cursor = Cursor::new(decompressed_data);
    let quiz: Quiz = bincode::options()
        .with_little_endian()
        .deserialize_from(cursor)
        .map_err(|e| format!("Failed to deserialize quiz data: {}", e))?;

    Ok(quiz)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_encryption() {
        let input = "test".as_bytes().to_vec();
        let encrypt_input = encrypt(input.clone());
        assert_ne!(input, encrypt_input.unwrap())
    }
    #[test]
    fn test_hash() {
        let input = b"test data".to_vec();
        let compressed = compress_data(input.clone());
        let decompressed = decompress_data(compressed.clone());

        let compressed_hash = hash(&compressed);
        let decompressed_hash = hash(&decompressed);

        println!("Compressed hash: {}", compressed_hash);
        println!("Decompressed hash: {}", decompressed_hash);

        assert_eq!(input, decompressed);
    }

    #[test]
    fn test_decryption() {
        let input = "test".as_bytes().to_vec();
        let _encrypt_input = encrypt(input.clone());
        let encrypt_result = encrypt(input.clone()).expect("Encryption failed");
        let decrypt_input = decrypt(&encrypt_result).expect("Decryption failed");
        assert_eq!(input, decrypt_input);
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

    #[test]
    fn test_compress() {
        let input = "test".as_bytes().to_vec();
        let compress_input = compress_data(input.clone());
        assert_ne!(input, compress_input)
    }

    #[test]
    fn test_decompress() {
        let input = "test".as_bytes().to_vec();
        let compress_input = compress_data(input.clone());
        let decompress_input = decompress_data(compress_input);
        assert_eq!(input, decompress_input)
    }
    #[test]
    fn test_compress_decompress() {
        let input = b"test data".to_vec();
        let compressed = compress_data(input.clone());
        let decompressed = decompress_data(compressed);
        assert_eq!(input, decompressed);
    }
    #[test]
    fn test_encrypt_decrypt() {
        let input = b"test data".to_vec();
        let encrypted = encrypt(input.clone()).expect("Encryption failed");
        let decrypted = decrypt(&encrypted).expect("Decryption failed");
        assert_eq!(input, decrypted);
    }
}
