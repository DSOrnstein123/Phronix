use crate::domain::{
    errors::node::NodeError, models::node::NodeDetail, ports::node_repository::NodeRepository,
};

pub struct ApplyTemplateUseCase<'a, R: NodeRepository> {
    repo: &'a R,
}

impl<'a, R: NodeRepository> ApplyTemplateUseCase<'a, R> {
    pub fn new(repo: &'a R) -> Self {
        Self { repo: repo }
    }

    pub async fn execute(
        &self,
        template_id: &str,
        target_id: &str,
    ) -> Result<NodeDetail, NodeError> {
        self.repo.apply_template(template_id, target_id).await
    }
}
