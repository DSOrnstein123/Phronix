-- Add migration script here
CREATE TABLE node_links (
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,

  PRIMARY KEY (source_node_id, target_node_id),

  FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);