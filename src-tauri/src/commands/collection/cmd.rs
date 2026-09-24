use backend::infrastructure::document::models::{Collection, DocumentInCollection, Property};
use tauri::State;

use crate::AppState;

#[tauri::command]
#[specta::specta]
pub async fn get_collection(state: State<'_, AppState>, id: String) -> Result<Collection, String> {
    backend::infrastructure::collection::collection::get_collection(&state.db, id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_collection(state: State<'_, AppState>) -> Result<Collection, String> {
    backend::infrastructure::collection::collection::create_collection(&state.db)
        .await
        .map_err(|e| e.to_string())
}

// #[tauri::command]
#[specta::specta]
// pub async fn create_document_in_collection(
//     state: State<'_, AppState>,
//     collection_id: String,
// ) -> Result<DocumentInCollection, String> {
//     backend::features::documents::document::create_document_in_collection(&state.db, collection_id)
//         .await
//         .map_err(|e| e.to_string())
// }
#[tauri::command]
#[specta::specta]
pub async fn get_documents_in_collection(
    state: State<'_, AppState>,
    collection_id: String,
) -> Result<Vec<DocumentInCollection>, String> {
    backend::features::document::repo::get_documents_in_collection(&state.db, collection_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_document_in_collection(
    state: State<'_, AppState>,
    collection_id: String,
) -> Result<DocumentInCollection, String> {
    backend::features::collection::collection::create_document_in_collection(
        &state.db,
        collection_id,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_property(
    state: State<'_, AppState>,
    collection_id: String,
    name: String,
    property_type: String,
) -> Result<Property, String> {
    backend::features::collection::collection::create_property(
        &state.db,
        collection_id,
        name,
        property_type,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn update_document_property(
    state: State<'_, AppState>,
    document_id: String,
    property_id: String,
    new_value: String,
) -> Result<(), String> {
    backend::features::collection::collection::update_document_property(
        &state.db,
        document_id,
        property_id,
        new_value,
    )
    .await
    .map_err(|e| e.to_string())
}
