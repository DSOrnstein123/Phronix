use backend::{
    database::{connect::connect, migrate::migrate},
    infrastructure::node::repo::SqliteNodeRepository,
};
use sqlx::SqlitePool;
use tauri::Manager;

pub mod commands;
pub mod dtos;

#[allow(dead_code)]
pub struct AppState {
    db: SqlitePool,
    pub node_repo: SqliteNodeRepository,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let specta_builder = app_builder!();

    #[cfg(debug_assertions)]
    specta_builder
        .export(
            specta_typescript::Typescript::default(),
            "../frontend/src/infrastructure/bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .setup(move |app| {
            specta_builder.mount_events(app);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            tauri::async_runtime::block_on(async {
                let db = connect().await;
                migrate(&db).await?;

                app.manage(AppState {
                    db: db.clone(),
                    node_repo: SqliteNodeRepository::new(db.clone()),
                });

                Ok::<(), Box<dyn std::error::Error>>(())
            })?;

            Ok(())
        })
        .invoke_handler(specta_builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
