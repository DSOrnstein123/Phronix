use crate::domain::{errors::node::NodeError, models::icon::IconData};
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum NodeKind {
    Folder,
    File,
    Template,
}

impl FromStr for NodeKind {
    type Err = NodeError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "folder" => Ok(NodeKind::Folder),
            "file" => Ok(NodeKind::File),
            "template" => Ok(NodeKind::Template),
            _ => Err(NodeError::InvalidKind(s.to_string())),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Node {
    pub id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub kind: NodeKind,
    pub node_type: String,
    pub data: Option<Value>,
    pub properties: Option<Value>,
}

impl Node {
    pub fn create(
        parent_id: Option<String>,
        name: String,
        kind: NodeKind,
        node_type: String,
        data: Option<Value>,
        properties: Option<Value>,
    ) -> Result<Self, NodeError> {
        // if name.trim().is_empty() {
        //     return Err(Error);
        // }

        Ok(Self {
            id: Uuid::new_v4().simple().to_string(),
            parent_id,
            name,
            kind,
            node_type,
            data,
            properties,
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeMetadata {
    pub id: String,
    pub parent_id: Option<String>,
    pub icon: IconData,
    pub name: String,
    pub kind: NodeKind,
    pub node_type: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub is_trashed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeDetail {
    pub metadata: NodeMetadata,
    pub data: Value,
    pub properties: Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeFilterOptions {
    pub include_kinds: Vec<NodeKind>,
    pub include_types: Vec<String>,
    pub exclude_kinds: Vec<NodeKind>,
    pub exclude_types: Vec<String>,
}

impl std::fmt::Display for NodeKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NodeKind::Folder => write!(f, "folder"),
            NodeKind::File => write!(f, "file"),
            NodeKind::Template => write!(f, "template"),
        }
    }
}
