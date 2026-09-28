// pub mod collection;
pub mod flashcard;
pub mod node;
pub mod node_link;

#[macro_export]
macro_rules! app_builder {
    () => {{
        // use $crate::commands::features::collection::cmd as collection;
        use $crate::commands::flashcard::deck;
        use $crate::commands::node;
        use $crate::commands::node_link;

        tauri_specta::Builder::<tauri::Wry>::new().commands(tauri_specta::collect_commands![
            //core/node
            node::get_nodes,
            node::get_node_detail,
            node::get_details_by_ids,
            node::create_node,
            node::update_node_name,
            node::update_node_data,
            node::apply_template,
            // node_link
            node_link::get_forward_links,
            node_link::get_backlinks,
            node_link::create_link_with_metadata,
            // flashcard
            deck::get_decks,
            deck::get_cards_from_deck,
            deck::create_deck,
        ])
    }};
}
