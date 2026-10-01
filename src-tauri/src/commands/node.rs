use backend::application::node::{
    dtos::CreateNodeInput,
    queries::NodeQuery,
    use_cases::{
        apply_template::ApplyTemplateUseCase, create_node::CreateNodeUseCase,
        update_node_data::UpdateNodeDataUseCase, update_node_name::UpdateNodeNameUseCase,
    },
};
use tauri::State;

use crate::{
    dtos::node::{CreateNodePayload, NodeDetail, NodeFilterOptions, NodeMetadata},
    AppState,
};

#[tauri::command]
#[specta::specta]
pub async fn get_nodes(
    state: State<'_, AppState>,
    options: Option<NodeFilterOptions>,
) -> Result<Vec<NodeMetadata>, String> {
    let query_service = NodeQuery::new(&state.node_repo);

    query_service
        .get_nodes(options.unwrap_or_default().into())
        .await
        .map(|domain_nodes| domain_nodes.into_iter().map(Into::into).collect())
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_node_detail(state: State<'_, AppState>, id: &str) -> Result<NodeDetail, String> {
    let query_service = NodeQuery::new(&state.node_repo);

    query_service
        .get_node_detail(id)
        .await
        .map(Into::into)
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn get_details_by_ids(
    state: State<'_, AppState>,
    ids: Vec<String>,
) -> Result<Vec<NodeDetail>, String> {
    let query_service = NodeQuery::new(&state.node_repo);

    let ids: &[String] = &ids;

    query_service
        .get_details_by_ids(ids)
        .await
        .map(|domain_nodes| domain_nodes.into_iter().map(Into::into).collect())
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn create_node(
    state: State<'_, AppState>,
    payload: CreateNodePayload,
) -> Result<NodeDetail, String> {
    let input: CreateNodeInput = payload.into();

    let use_case = CreateNodeUseCase::new(&state.node_repo);

    use_case
        .execute(input)
        .await
        .map(Into::into)
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn update_node_name(
    state: State<'_, AppState>,
    id: &str,
    new_name: &str,
) -> Result<(), String> {
    let use_case = UpdateNodeNameUseCase::new(&state.node_repo);

    use_case
        .execute(id, new_name)
        .await
        .map(|_| ())
        .map_err(|err| err.to_string())
}

use crate::dtos::any_json::AnyJsonValue;

#[tauri::command]
#[specta::specta]
pub async fn update_node_data(
    state: State<'_, AppState>,
    id: &str,
    new_data: AnyJsonValue,
) -> Result<(), String> {
    let use_case = UpdateNodeDataUseCase::new(&state.node_repo);

    use_case
        .execute(id, new_data.0)
        .await
        .map(|_| ())
        .map_err(|err| err.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn apply_template(
    state: State<'_, AppState>,
    template_id: &str,
    target_id: &str,
) -> Result<NodeDetail, String> {
    let use_case = ApplyTemplateUseCase::new(&state.node_repo);

    use_case
        .execute(template_id, target_id)
        .await
        .map(Into::into)
        .map_err(|err| err.to_string())
}
