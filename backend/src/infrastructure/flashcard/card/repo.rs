use serde::Serialize;
use sqlx::{SqlitePool, query_as};
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct Card {
    pub id: Uuid,
    pub front: String,
    pub back: String,
}

#[allow(dead_code)]
pub async fn get_cards_from_deck(
    pool: &SqlitePool,
    deck_id: Uuid,
) -> Result<Vec<Card>, sqlx::Error> {
    let cards = query_as!(
        Card,
        r#"
          SELECT 
            f.id as "id!: Uuid",
            f.front,
            f.back 
          FROM decks_flashcards df 
          JOIN flashcards f on f.id = df.flashcard_id
          WHERE df.deck_id = ?
      "#,
        deck_id
    )
    .fetch_all(pool)
    .await?;

    Ok(cards)
}
