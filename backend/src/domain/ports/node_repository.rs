use crate::domain::{
    errors::node::NodeError,
    models::node::{Node, NodeDetail, NodeFilterOptions, NodeMetadata},
};
use async_trait::async_trait;
use serde_json::Value;

#[async_trait]
pub trait NodeRepository: Send + Sync {
    async fn get_list(
        &self,
        options: Option<NodeFilterOptions>,
    ) -> Result<Vec<NodeMetadata>, NodeError>;
    async fn get_detail(&self, id: &str) -> Result<NodeDetail, NodeError>;
    async fn get_details_by_ids(&self, ids: &[String]) -> Result<Vec<NodeDetail>, NodeError>;
    async fn get_metadata(&self, id: &str) -> Result<NodeMetadata, NodeError>;
    async fn create(&self, node: &Node) -> Result<NodeDetail, NodeError>;
    async fn update_name(&self, id: &str, new_name: &str) -> Result<(), NodeError>;
    async fn update_data(&self, id: &str, new_data: Value) -> Result<(), NodeError>;
    async fn apply_template(
        &self,
        template_id: &str,
        target_id: &str,
    ) -> Result<NodeDetail, NodeError>;
}
