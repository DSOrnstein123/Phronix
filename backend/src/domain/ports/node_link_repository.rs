use async_trait::async_trait;

use crate::domain::{errors::node::NodeError, models::node::NodeMetadata};

#[async_trait]
pub trait NodeLinkRepository: Send + Sync {
    async fn get_forward_links(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError>;
    async fn get_backlinks(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError>;
    async fn create(&self, source_node_id: &str, target_node_id: &str) -> Result<(), NodeError>;
}
