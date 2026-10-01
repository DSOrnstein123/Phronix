use backend::infrastructure::flashcard::{card::repo::Card as DomainCard, deck::repo::Deck as DomainDeck};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct Deck {
    pub id: Uuid,
    pub name: String,
    pub parent_id: Option<Uuid>,
}

impl From<DomainDeck> for Deck {
    fn from(domain: DomainDeck) -> Self {
        let DomainDeck { id, name, parent_id } = domain;
        Self { id, name, parent_id }
    }
}

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct Card {
    pub id: Uuid,
    pub front: String,
    pub back: String,
}

impl From<DomainCard> for Card {
    fn from(domain: DomainCard) -> Self {
        let DomainCard { id, front, back } = domain;
        Self { id, front, back }
    }
}
