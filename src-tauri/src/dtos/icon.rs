use backend::domain::models::icon::IconData;
use serde::Serialize;

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct IconDataDto {
    #[serde(rename = "type")]
    pub icon_type: String,
    pub value: String,
}

impl From<IconData> for IconDataDto {
    fn from(domain: IconData) -> Self {
        let IconData { icon_type, value } = domain;
        Self { icon_type, value }
    }
}
