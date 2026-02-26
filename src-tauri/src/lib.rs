use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Initialize the shell plugin we just installed
        .plugin(tauri_plugin_shell::init()) 
        .setup(|app| {
            // 1. Find the Go Sidecar Engine
            let sidecar_command = app.shell()
                .sidecar("inventory")
                .expect("Failed to create `inventory` binary command");
            
            // 2. Start the Engine in the background!
            let (_receiver, mut _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn Go sidecar");

            println!("🚀 HYTECH GO ENGINE STARTED SUCCESSFULLY!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}