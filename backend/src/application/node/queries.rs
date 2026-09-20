use crate::domain::errors::node::NodeError;
use crate::domain::models::node::{NodeDetail, NodeFilterOptions, NodeMetadata};
use crate::domain::ports::node_repository::NodeRepository;

pub struct NodeQuery<'a, R: NodeRepository> {
    repo: &'a R,
}

impl<'a, R: NodeRepository> NodeQuery<'a, R> {
    pub fn new(repo: &'a R) -> Self {
        Self { repo }
    }

    pub async fn get_nodes(
        &self,
        options: Option<NodeFilterOptions>,
    ) -> Result<Vec<NodeMetadata>, NodeError> {
        self.repo.get_list(options).await
    }

    pub async fn get_node_detail(&self, id: &str) -> Result<NodeDetail, NodeError> {
        self.repo.get_detail(id).await
    }

    pub async fn get_details_by_ids(&self, ids: &[String]) -> Result<Vec<NodeDetail>, NodeError> {
        self.repo.get_details_by_ids(ids).await
    }

    pub async fn get_node_metadata(&self, id: &str) -> Result<NodeMetadata, NodeError> {
        self.repo.get_metadata(id).await
    }
}
