// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, AppHandle};

mod zoom_sdk;
use zoom_sdk::{get_zoom_sdk, ZoomSessionConfig, ZoomSDKError};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_devtools(app_handle: AppHandle) {
    if let Some(webview_window) = app_handle.get_webview_window("main") {
        webview_window.open_devtools();
    }
}

#[tauri::command]
async fn zoom_initialize(domain: Option<String>) -> Result<(), ZoomSDKError> {
    let sdk = get_zoom_sdk();
    let mut sdk_manager = sdk.lock().unwrap();
    sdk_manager.initialize(domain.as_deref())
}

#[tauri::command]
async fn zoom_join_session(config: ZoomSessionConfig) -> Result<(), ZoomSDKError> {
    let sdk = get_zoom_sdk();
    let sdk_manager = sdk.lock().unwrap();
    sdk_manager.join_session(&config)
}

#[tauri::command]
async fn zoom_leave_session() -> Result<(), ZoomSDKError> {
    let sdk = get_zoom_sdk();
    let sdk_manager = sdk.lock().unwrap();
    sdk_manager.leave_session()
}

#[tauri::command]
async fn zoom_cleanup() -> Result<(), ZoomSDKError> {
    let sdk = get_zoom_sdk();
    let mut sdk_manager = sdk.lock().unwrap();
    sdk_manager.cleanup();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet, 
            open_devtools,
            zoom_initialize,
            zoom_join_session,
            zoom_leave_session,
            zoom_cleanup
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}