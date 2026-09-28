use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Serialize, Deserialize)]
#[serde(transparent)]
pub struct AnyJsonValue(pub serde_json::Value);

impl Type for AnyJsonValue {
    fn definition(types: &mut specta::Types) -> specta::datatype::DataType {
        String::definition(types)
    }
}
