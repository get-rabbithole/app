#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{SystemTray, Manager, SystemTrayEvent, SystemTrayMenu, CustomMenuItem};
use tauri_plugin_positioner::{Position, WindowExt};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct ProgressPayload {
  progress: i32,
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");

    let system_tray_menu = SystemTrayMenu::new()
        .add_item(quit);

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu).with_title("Rabbithole"))
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.handle();

            app.listen_global("quit",  | _ | {
                std::process::exit(0);
            });

            app.listen_global("progress", move |event| {
                if let Some(payload) = event.payload() {
                    let data: Result<ProgressPayload, _> = serde_json::from_str(payload);

                    match data {
                        Ok(data) => {
                            match data.progress {
                                10 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-10.png").to_vec())).unwrap(),
                                20 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-20.png").to_vec())).unwrap(),
                                30 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-30.png").to_vec())).unwrap(),
                                40 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-40.png").to_vec())).unwrap(),
                                50 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-50.png").to_vec())).unwrap(),
                                60 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-60.png").to_vec())).unwrap(),
                                70 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-70.png").to_vec())).unwrap(),
                                80 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-80.png").to_vec())).unwrap(),
                                90 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/progress/progress-90.png").to_vec())).unwrap(),
                                100 => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/icon.png").to_vec())).unwrap(),
                                _ => handle.tray_handle().set_icon(tauri::Icon::Raw(include_bytes!("../icons/icon.png").to_vec())).unwrap(),
                            }
                        }
                        Err(e) => {
                            println!("Failed to deserialize payload: {}", e);
                        }
                    }
                }
            });

            let window = app.get_window("main").unwrap();
            
            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &window, 
                NSVisualEffectMaterial::Menu, 
                Some(NSVisualEffectState::Active), 
                Some(6.0)
            ).expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            Ok(())
        })
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    // use TrayCenter as initial window position
                    let _ = window.move_window(Position::TrayCenter);
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                },
                SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                },
                _ => {}
            }
        })
        // .on_window_event(|event| match event.event() {
        //     tauri::WindowEvent::Focused(is_focused) => {
        //         // detect click outside of the focused window and hide the app
        //         if !is_focused {
        //             event.window().hide().unwrap();
        //         }
        //     }
        //     _ => {}
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
