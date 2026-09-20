use crate::domain::errors::node::NodeError;
use crate::domain::models::node::NodeMetadata;
use crate::domain::ports::node_link_repository::NodeLinkRepository;

pub struct NodeLinkQuery<'a, R: NodeLinkRepository> {
    repo: &'a R,
}

impl<'a, R: NodeLinkRepository> NodeLinkQuery<'a, R> {
    pub fn new(repo: &'a R) -> Self {
        Self { repo }
    }

    pub async fn get_forward_links(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError> {
        self.repo.get_forward_links(id).await
    }

    // pub async fn get_backlinks(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError> {
    //     self.repo.get_backlinks(id).await
    // }
}
