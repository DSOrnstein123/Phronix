use crate::domain::{errors::node::NodeError, ports::node_link_repository::NodeLinkRepository};

pub struct CreateNodeLinkUseCase<'a, R: NodeLinkRepository> {
    repo: &'a R,
}

impl<'a, R: NodeLinkRepository> CreateNodeLinkUseCase<'a, R> {
    pub fn new(repo: &'a R) -> Self {
        Self { repo: repo }
    }

    pub async fn execute(
        &self,
        source_node_id: &str,
        target_node_id: &str,
    ) -> Result<(), NodeError> {
        self.repo.create(source_node_id, target_node_id).await
    }
}
