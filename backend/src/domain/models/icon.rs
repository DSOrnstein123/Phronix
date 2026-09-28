use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct IconData {
    pub icon_type: String,
    pub value: String,
}
