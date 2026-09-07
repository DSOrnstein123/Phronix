use crate::domain::{errors::node::NodeError, models::node::NodeDetail};
use async_trait::async_trait;

#[async_trait]
pub trait NodeLinkRepository: Send + Sync {
    async fn create_link(
        &self,
        source_link: &str,
        target_link: &str,
    ) -> Result<NodeDetail, NodeError>;
}
