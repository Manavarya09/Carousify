#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use image::GenericImageView;
use std::fs::File;
use std::io::{Read, Write};
use std::path::PathBuf;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

#[derive(serde::Serialize)]
pub struct ExportResult {
    success: bool,
    path: Option<String>,
    error: Option<String>,
}

#[tauri::command]
fn export_carousel_slices(
    images: Vec<String>,
    slot_width: u32,
    slot_height: u32,
    output_path: String,
) -> ExportResult {
    let mut zip_path = PathBuf::from(&output_path);
    zip_path.set_extension("zip");

    let file = match File::create(&zip_path) {
        Ok(f) => f,
        Err(e) => {
            return ExportResult {
                success: false,
                path: None,
                error: Some(format!("Failed to create file: {}", e)),
            }
        }
    };

    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    for (i, img_data) in images.iter().enumerate() {
        let img_bytes = match BASE64.decode(img_data) {
            Ok(b) => b,
            Err(e) => {
                return ExportResult {
                    success: false,
                    path: None,
                    error: Some(format!("Failed to decode image: {}", e)),
                }
            }
        };

        let img = match image::load_from_memory(&img_bytes) {
            Ok(i) => i,
            Err(e) => {
                return ExportResult {
                    success: false,
                    path: None,
                    error: Some(format!("Failed to load image: {}", e)),
                }
            }
        };

        let resized = img.resize_exact(
            slot_width,
            slot_height,
            image::imageops::FilterType::Lanczos3,
        );

        let mut buffer = Vec::new();
        let mut cursor = std::io::Cursor::new(&mut buffer);

        if let Err(e) = resized.write_to(&mut cursor, image::ImageFormat::Png) {
            return ExportResult {
                success: false,
                path: None,
                error: Some(format!("Failed to encode image: {}", e)),
            };
        }

        let filename = format!("carousel-{}.png", i + 1);
        if let Err(e) = zip.start_file(&filename, options) {
            return ExportResult {
                success: false,
                path: None,
                error: Some(format!("Failed to write to zip: {}", e)),
            };
        }

        if let Err(e) = zip.write_all(&buffer) {
            return ExportResult {
                success: false,
                path: None,
                error: Some(format!("Failed to write image to zip: {}", e)),
            };
        }
    }

    if let Err(e) = zip.finish() {
        return ExportResult {
            success: false,
            path: None,
            error: Some(format!("Failed to finalize zip: {}", e)),
        };
    }

    ExportResult {
        success: true,
        path: Some(zip_path.to_string_lossy().to_string()),
        error: None,
    }
}

#[tauri::command]
fn export_full_canvas(
    images: Vec<String>,
    positions: Vec<Position>,
    canvas_width: u32,
    canvas_height: u32,
    output_path: String,
) -> ExportResult {
    let mut img = image::RgbaImage::new(canvas_width, canvas_height);

    for (img_data, pos) in images.iter().zip(positions.iter()) {
        let img_bytes = match BASE64.decode(img_data) {
            Ok(b) => b,
            Err(e) => {
                return ExportResult {
                    success: false,
                    path: None,
                    error: Some(format!("Failed to decode image: {}", e)),
                }
            }
        };

        let img = match image::load_from_memory(&img_bytes) {
            Ok(i) => i,
            Err(e) => {
                return ExportResult {
                    success: false,
                    path: None,
                    error: Some(format!("Failed to load image: {}", e)),
                }
            }
        };

        let resized =
            img.resize_exact(pos.width, pos.height, image::imageops::FilterType::Lanczos3);

        image::imageops::overlay(&mut img, resized.to_rgba8(), pos.x as i64, pos.y as i64);
    }

    if let Err(e) = img.save(&output_path) {
        return ExportResult {
            success: false,
            path: None,
            error: Some(format!("Failed to save image: {}", e)),
        };
    }

    ExportResult {
        success: true,
        path: Some(output_path),
        error: None,
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
struct Position {
    x: u32,
    y: u32,
    width: u32,
    height: u32,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            export_carousel_slices,
            export_full_canvas
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
