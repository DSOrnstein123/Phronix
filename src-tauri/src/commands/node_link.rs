use tauri::State;

use crate::{dtos::node::NodeMetadataDto, AppState};

#[tauri::command]
pub async fn get_forward_links(
    state: State<'_, AppState>,
    template_id: &str,
    target_id: &str,
) -> Result<Vec<NodeMetadataDto>, String> {
    let use_case = ApplyTemplateUseCase::new(&state.node_repo);

    use_case
        .execute(template_id, target_id)
        .await
        .map(Into::into)
        .map_err(|err| err.to_string())
}
