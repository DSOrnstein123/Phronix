use backend::application::{
    node::queries::node_query::NodeQuery,
    node_link::use_cases::create_node_link::CreateNodeLinkUseCase,
};
use tauri::State;

use crate::{dtos::node::NodeMetadataDto, AppState};

#[tauri::command]
pub async fn create_link_with_metadata(
    state: State<'_, AppState>,
    source_node_id: &str,
    target_node_id: &str,
) -> Result<NodeMetadataDto, String> {
    let use_case = CreateNodeLinkUseCase::new(&state.node_repo);

    use_case
        .execute(source_node_id, target_node_id)
        .await
        .map_err(|err| err.to_string())?;

    let query_service = NodeQuery::new(&state.node_repo);

    query_service
        .get_node_metadata(target_node_id)
        .await
        .map(Into::into)
        .map_err(|err| err.to_string())
}
