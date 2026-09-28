use backend::infrastructure::document::models::DocumentFile;
use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::types::Json;

use crate::dtos::icon::IconDataDto;

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct DocumentFileDto {
    pub id: String,
    pub parent_id: Option<String>,
    pub name: String,
    #[serde(rename = "type")]
    pub file_type: String,
    pub icon: IconDataDto,
    pub data: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl From<DocumentFile> for DocumentFileDto {
    fn from(domain: DocumentFile) -> Self {
        let DocumentFile {
            id,
            parent_id,
            name,
            file_type,
            icon,
            data,
            created_at,
            updated_at,
        } = domain;
        
        Self {
            id,
            parent_id,
            name,
            file_type,
            icon: icon.0.into(),
            data,
            created_at,
            updated_at,
        }
    }
}
