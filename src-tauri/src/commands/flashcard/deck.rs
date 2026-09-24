use backend::infrastructure::flashcard::{card::repo::Card, deck::repo::Deck};
use sqlx::types::Uuid;
use tauri::State;

use crate::AppState;

#[tauri::command]
#[specta::specta]
pub async fn get_decks(state: State<'_, AppState>) -> Result<Vec<Deck>, String> {
    backend::infrastructure::flashcard::deck::repo::get_decks(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_cards_from_deck(
    state: State<'_, AppState>,
    deck_id: Uuid,
) -> Result<Vec<Card>, String> {
    backend::infrastructure::flashcard::card::repo::get_cards_from_deck(&state.db, deck_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_deck(
    state: State<'_, AppState>,
    name: String,
    parent_id: Option<Uuid>,
) -> Result<Deck, String> {
    backend::infrastructure::flashcard::deck::repo::create_deck(&state.db, name, parent_id)
        .await
        .map_err(|e| e.to_string())
}
