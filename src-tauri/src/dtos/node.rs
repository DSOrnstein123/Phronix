use backend::{
    application::node::dtos::CreateNodeInput,
    domain::models::node::{NodeDetail, NodeKind, NodeMetadata},
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::dtos::icon::IconDataDto;

#[derive(Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "lowercase")]
pub enum NodeKindDto {
    Folder,
    File,
    Template,
}

impl From<NodeKind> for NodeKindDto {
    fn from(kind: NodeKind) -> Self {
        match kind {
            NodeKind::Folder => NodeKindDto::Folder,
            NodeKind::File => NodeKindDto::File,
            NodeKind::Template => NodeKindDto::Template,
        }
    }
}

impl From<NodeKindDto> for NodeKind {
    fn from(dto: NodeKindDto) -> Self {
        match dto {
            NodeKindDto::Folder => NodeKind::Folder,
            NodeKindDto::File => NodeKind::File,
            NodeKindDto::Template => NodeKind::Template,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NodeFilterOptionsDto {
    pub include_kinds: Option<Vec<NodeKindDto>>,
    pub include_types: Option<Vec<String>>,
    pub exclude_kinds: Option<Vec<NodeKindDto>>,
    pub exclude_types: Option<Vec<String>>,
}

impl From<NodeFilterOptionsDto> for backend::domain::models::node::NodeFilterOptions {
    fn from(dto: NodeFilterOptionsDto) -> Self {
        let NodeFilterOptionsDto {
            include_kinds,
            include_types,
            exclude_kinds,
            exclude_types,
        } = dto;

        Self {
            include_kinds: include_kinds.map(|kinds| kinds.into_iter().map(Into::into).collect()),
            include_types,
            exclude_kinds: exclude_kinds.map(|kinds| kinds.into_iter().map(Into::into).collect()),
            exclude_types,
        }
    }
}

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NodeMetadataDto {
    pub id: String,
    pub parent_id: Option<String>,
    pub icon: IconDataDto,
    pub name: String,
    pub kind: NodeKindDto,
    #[serde(rename = "type")]
    pub node_type: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_trashed: bool,
}

impl From<NodeMetadata> for NodeMetadataDto {
    fn from(domain: NodeMetadata) -> Self {
        let NodeMetadata {
            id,
            parent_id,
            icon,
            name,
            kind,
            node_type,
            created_at,
            updated_at,
            is_trashed,
        } = domain;

        Self {
            id,
            parent_id,
            icon: icon.into(),
            name,
            kind: kind.into(),
            node_type,
            created_at: created_at.to_string(),
            updated_at: updated_at.to_string(),
            is_trashed,
        }
    }
}

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NodeDetailDto {
    #[serde(flatten)]
    pub metadata: NodeMetadataDto,
    #[specta(type = crate::dtos::any_json::AnyJsonValue)]
    pub data: Value,
    #[specta(type = crate::dtos::any_json::AnyJsonValue)]
    pub properties: Value,
}

impl From<NodeDetail> for NodeDetailDto {
    fn from(domain: NodeDetail) -> Self {
        let NodeDetail {
            metadata,
            data,
            properties,
        } = domain;

        Self {
            metadata: metadata.into(),
            data,
            properties,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct CreateNodePayload {
    pub parent_id: Option<String>,
    pub name: String,
    pub kind: NodeKindDto,
    #[serde(rename = "type")]
    pub node_type: String,
    #[serde(default = "default_node_data")]
    #[specta(type = crate::dtos::any_json::AnyJsonValue)]
    pub data: Value,
    #[specta(type = Option<crate::dtos::any_json::AnyJsonValue>)]
    pub properties: Option<Value>,
}

fn default_node_data() -> Value {
    json!({})
}

impl From<CreateNodePayload> for CreateNodeInput {
    fn from(payload: CreateNodePayload) -> Self {
        let CreateNodePayload {
            parent_id,
            name,
            kind,
            node_type,
            data,
            properties,
        } = payload;

        Self {
            parent_id,
            name,
            node_type,
            kind: kind.into(),
            data: if data.is_null() { None } else { Some(data) },
            properties,
        }
    }
}
