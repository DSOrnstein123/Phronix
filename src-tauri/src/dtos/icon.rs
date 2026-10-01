use backend::domain::models::icon::IconData as DomainIconData;
use serde::Serialize;

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct IconData {
    #[serde(rename = "type")]
    pub icon_type: String,
    pub value: String,
}

impl From<DomainIconData> for IconData {
    fn from(domain: DomainIconData) -> Self {
        let DomainIconData { icon_type, value } = domain;
        Self { icon_type, value }
    }
}
