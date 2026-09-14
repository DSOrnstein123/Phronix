use crate::domain::errors::node::NodeError;
use crate::domain::models::icon::IconData;
use crate::domain::models::node::{Node, NodeDetail, NodeFilterOptions, NodeMetadata};
use crate::domain::ports::node_link_repository::NodeLinkRepository;
use crate::domain::ports::node_repository::NodeRepository;
use crate::infrastructure::node::models::{DbNodeDetail, DbNodeMetadata, TemplateData};
use async_trait::async_trait;
use serde_json::Value;
use sqlx::types::Json;
use sqlx::{Executor, QueryBuilder, Sqlite, SqlitePool, query, query_as};
// TODO: split into new file
pub struct SqliteNodeRepository {
    pub pool: SqlitePool,
}

impl SqliteNodeRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl NodeRepository for SqliteNodeRepository {
    async fn get_detail(&self, id: &str) -> Result<NodeDetail, NodeError> {
        let db_node = query_as!(
            DbNodeDetail,
            r#"
              SELECT 
                id as "id!: String",
                parent_id,
                icon as "icon: Json<IconData>",
                name,
                kind,
                type as node_type,
                data as "data: Json<Value>",
                properties as "properties: Json<Value>",
                created_at,
                updated_at,
                is_trashed
              FROM nodes
              WHERE id = ? AND is_trashed = 0
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => NodeError::NotFound(id.to_string()),
            e => NodeError::Database(e.to_string()),
        })?;

        Ok(db_node.into())
    }

    async fn get_list(
        &self,
        options: Option<NodeFilterOptions>,
    ) -> Result<Vec<NodeMetadata>, NodeError> {
        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            r#"
            SELECT 
                id,
                parent_id,
                icon,
                name,
                kind,
                type as node_type,
                is_trashed,
                created_at,
                updated_at
            FROM nodes
            WHERE is_trashed = 0
            "#,
        );

        if let Some(opts) = options {
            if let Some(kinds) = opts.include_kinds {
                if !kinds.is_empty() {
                    builder.push(" AND kind IN (");
                    let mut separated = builder.separated(", ");
                    for k in kinds {
                        separated.push_bind(k.to_string());
                    }
                    separated.push_unseparated(")");
                }
            }

            if let Some(kinds) = opts.exclude_kinds {
                if !kinds.is_empty() {
                    builder.push(" AND kind NOT IN (");
                    let mut separated = builder.separated(", ");
                    for k in kinds {
                        separated.push_bind(k.to_string());
                    }
                    separated.push_unseparated(")");
                }
            }

            if let Some(types) = opts.include_types {
                if !types.is_empty() {
                    builder.push(" AND type IN (");
                    let mut separated = builder.separated(", ");
                    for t in types {
                        separated.push_bind(t);
                    }
                    separated.push_unseparated(")");
                }
            }

            if let Some(types) = opts.exclude_types {
                if !types.is_empty() {
                    builder.push(" AND type NOT IN (");
                    let mut separated = builder.separated(", ");
                    for t in types {
                        separated.push_bind(t);
                    }
                    separated.push_unseparated(")");
                }
            }
        }

        let nodes = builder
            .build_query_as::<DbNodeMetadata>()
            .fetch_all(&self.pool)
            .await
            .map_err(|e| NodeError::Database(e.to_string()))?;

        Ok(nodes.into_iter().map(Into::into).collect())
    }

    async fn get_details_by_ids(&self, ids: &[String]) -> Result<Vec<NodeDetail>, NodeError> {
        if ids.is_empty() {
            return Ok(vec![]);
        }

        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            r#"
        SELECT
            id,
            parent_id,
            icon,
            name,
            kind,
            type as node_type,
            data ,
            properties,
            created_at,
            updated_at,
            is_trashed
        FROM nodes
        WHERE is_trashed = 0
        AND id IN (
        "#,
        );

        let mut separated = builder.separated(", ");

        for id in ids {
            separated.push_bind(id);
        }

        separated.push_unseparated(")");

        let nodes = builder
            .build_query_as::<DbNodeDetail>()
            .fetch_all(&self.pool)
            .await
            .map_err(|e| NodeError::Database(e.to_string()))?;

        Ok(nodes.into_iter().map(Into::into).collect())
    }

    async fn get_metadata<'e, E>(&self, executor: E, id: &str) -> Result<NodeMetadata, NodeError>
    where
        E: Executor<'e, Database = sqlx::Sqlite>,
    {
        let db_node = query_as!(
            DbNodeMetadata,
            r#"
              SELECT 
                id as "id!: String",
                parent_id,
                icon as "icon: Json<IconData>",
                name,
                kind,
                type as node_type,
                created_at,
                updated_at,
                is_trashed
              FROM nodes
              WHERE id = ? AND is_trashed = 0
            "#,
            id
        )
        .fetch_one(executor)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => NodeError::NotFound(id.to_string()),
            e => NodeError::Database(e.to_string()),
        })?;

        Ok(db_node.into())
    }

    async fn create(&self, node: &Node) -> Result<NodeDetail, NodeError> {
        let icon = Json(IconData {
            icon_type: "lucide".to_string(),
            value: "FileText".to_string(),
        });
        let kind = node.kind.to_string();

        let db_node = query_as!(
            DbNodeDetail,
            r#"
            INSERT INTO nodes (id, parent_id, name, icon, kind, type, data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING
                id as "id!: String",
                parent_id,
                name,
                icon as "icon: Json<IconData>",
                kind,
                type as node_type,
                data as "data: Json<Value>",
                properties as "properties: Json<Value>",
                created_at,
                updated_at,
                is_trashed
        "#,
            node.id,
            node.parent_id,
            node.name,
            icon,
            kind,
            node.node_type,
            node.data
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| NodeError::Database(e.to_string()))?;

        Ok(db_node.into())
    }

    async fn update_name(&self, id: &str, new_name: &str) -> Result<(), NodeError> {
        query!(
            r#"
            UPDATE nodes
            SET name = ?
            WHERE id = ?
        "#,
            new_name,
            id,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => NodeError::NotFound(id.to_string()),
            e => NodeError::Database(e.to_string()),
        })?;

        Ok(())
    }

    async fn update_data(&self, id: &str, new_data: Value) -> Result<(), NodeError> {
        let data = Json(new_data);

        query!(
            r#"
                UPDATE nodes
                SET data = json_patch(data, ?)
                WHERE id = ?
            "#,
            data,
            id,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| NodeError::Database(e.to_string()))?;

        Ok(())
    }

    async fn apply_template(
        &self,
        template_id: &str,
        target_id: &str,
    ) -> Result<NodeDetail, NodeError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|error| NodeError::Database(error.to_string()))?;

        let template = query!(
            r#"
            SELECT
                kind AS "kind!",
                data AS "data: Json<Value>"
            FROM nodes
            WHERE id = ?
            "#,
            template_id,
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(|error| NodeError::Database(error.to_string()))?
        .ok_or_else(|| NodeError::NotFound(template_id.to_string()))?;

        if template.kind != "template" {
            return Err(NodeError::InvalidTemplate(template_id.to_string()));
        }

        let template_data: TemplateData =
            serde_json::from_value(template.data.0).map_err(|error| {
                NodeError::InvalidTemplateData {
                    id: template_id.to_string(),
                    message: error.to_string(),
                }
            })?;

        let default_data = Json(template_data.default_data);

        let result = query_as!(
            DbNodeDetail,
            r#"
            UPDATE nodes
            SET
                name = ?,
                data = ?
            WHERE id = ?
            RETURNING
                id as "id!: String",
                parent_id,
                icon as "icon: Json<IconData>",
                name,
                kind,
                type as node_type,
                data as "data: Json<Value>",
                properties as "properties: Json<Value>",
                created_at,
                updated_at,
                is_trashed
            "#,
            template_data.default_name,
            default_data,
            target_id,
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(|error| NodeError::Database(error.to_string()))?
        .ok_or_else(|| NodeError::NotFound(target_id.to_string()))?;

        tx.commit()
            .await
            .map_err(|error| NodeError::Database(error.to_string()))?;

        Ok(result.into())
    }
}

#[async_trait]
impl NodeLinkRepository for SqliteNodeRepository {
    async fn get_forward_links(&self, id: &str) -> Result<Vec<NodeMetadata>, NodeError> {
        let db_links = query_as!(
            DbNodeMetadata,
            r#"
              SELECT
                id as "id!: String",
                parent_id,
                icon as "icon: Json<IconData>",
                name,
                kind,
                type as node_type,
                created_at,
                updated_at,
                is_trashed
              FROM nodes n
              JOIN node_links nl
              ON nl.target_node_id = n.id
              WHERE nl.source_node_id = ? AND is_trashed = 0
            "#,
            id
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => NodeError::NotFound(id.to_string()),
            e => NodeError::Database(e.to_string()),
        })?;

        Ok(db_links.into_iter().map(Into::into).collect())
    }

    async fn create(
        &self,
        source_node_id: &str,
        target_node_id: &str,
    ) -> Result<NodeMetadata, NodeError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|error| NodeError::Database(error.to_string()))?;

        query!(
            r"
            INSERT INTO node_links (source_node_id, target_node_id) VALUES (?, ?)
        ",
            source_node_id,
            target_node_id
        )
        .execute(&mut *tx)
        .await
        // TODO: fix error log
        .map_err(|e| NodeError::Database(e.to_string()))?;

        let db_node = self.get_metadata(&mut *tx, target_node_id).await?;

        tx.commit()
            .await
            .map_err(|e| NodeError::Database(e.to_string()))?;

        Ok(db_node.into())
    }
}
