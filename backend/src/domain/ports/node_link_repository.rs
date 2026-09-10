use crate::domain::{errors::node::NodeError, models::node::NodeMetadata};

pub trait NodeLinkRepository: Send + Sync {
    async fn get_forward_links(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError>;
    async fn create(&self, source_link: &str, target_link: &str)
    -> Result<NodeMetadata, NodeError>;
}
