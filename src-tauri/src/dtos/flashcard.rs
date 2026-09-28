use backend::infrastructure::flashcard::{card::repo::Card, deck::repo::Deck};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct DeckDto {
    pub id: Uuid,
    pub name: String,
    pub parent_id: Option<Uuid>,
}

impl From<Deck> for DeckDto {
    fn from(domain: Deck) -> Self {
        let Deck {
            id,
            name,
            parent_id,
        } = domain;
        Self {
            id,
            name,
            parent_id,
        }
    }
}

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct CardDto {
    pub id: Uuid,
    pub front: String,
    pub back: String,
}

impl From<Card> for CardDto {
    fn from(domain: Card) -> Self {
        let Card { id, front, back } = domain;
        Self { id, front, back }
    }
}
