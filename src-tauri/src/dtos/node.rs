use backend::{
    application::node::dtos::CreateNodeInput,
    domain::models::node::{
        NodeDetail as DomainNodeDetail, NodeFilterOptions as DomainNodeFilterOptions,
        NodeKind as DomainNodeKind, NodeMetadata as DomainNodeMetadata,
    },
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::dtos::icon::IconData;

#[derive(Debug, Serialize, Deserialize, specta::Type)]
#[serde(rename_all = "lowercase")]
pub enum NodeKind {
    Folder,
    File,
    Template,
}

impl From<DomainNodeKind> for NodeKind {
    fn from(kind: DomainNodeKind) -> Self {
        match kind {
            DomainNodeKind::Folder => NodeKind::Folder,
            DomainNodeKind::File => NodeKind::File,
            DomainNodeKind::Template => NodeKind::Template,
        }
    }
}

impl From<NodeKind> for DomainNodeKind {
    fn from(dto: NodeKind) -> Self {
        match dto {
            NodeKind::Folder => DomainNodeKind::Folder,
            NodeKind::File => DomainNodeKind::File,
            NodeKind::Template => DomainNodeKind::Template,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Default, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NodeFilterOptions {
    #[serde(default)]
    pub include_kinds: Vec<NodeKind>,
    #[serde(default)]
    pub include_types: Vec<String>,
    #[serde(default)]
    pub exclude_kinds: Vec<NodeKind>,
    #[serde(default)]
    pub exclude_types: Vec<String>,
}

impl From<NodeFilterOptions> for DomainNodeFilterOptions {
    fn from(dto: NodeFilterOptions) -> Self {
        let NodeFilterOptions {
            include_kinds,
            include_types,
            exclude_kinds,
            exclude_types,
        } = dto;

        Self {
            include_kinds: include_kinds.into_iter().map(Into::into).collect(),

            include_types,

            exclude_kinds: exclude_kinds.into_iter().map(Into::into).collect(),

            exclude_types,
        }
    }
}

#[derive(Debug, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct NodeMetadata {
    pub id: String,
    pub parent_id: Option<String>,
    pub icon: IconData,
    pub name: String,
    pub kind: NodeKind,
    #[serde(rename = "type")]
    pub node_type: String,
    pub created_at: String,
    pub updated_at: String,
    pub is_trashed: bool,
}

impl From<DomainNodeMetadata> for NodeMetadata {
    fn from(domain: DomainNodeMetadata) -> Self {
        let DomainNodeMetadata {
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
pub struct NodeDetail {
    #[serde(flatten)]
    pub metadata: NodeMetadata,
    #[specta(type = crate::dtos::any_json::AnyJsonValue)]
    pub data: Value,
    #[specta(type = crate::dtos::any_json::AnyJsonValue)]
    pub properties: Value,
}

impl From<DomainNodeDetail> for NodeDetail {
    fn from(domain: DomainNodeDetail) -> Self {
        let DomainNodeDetail {
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
    pub kind: NodeKind,
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
