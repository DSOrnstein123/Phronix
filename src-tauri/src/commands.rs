// pub mod collection;
pub mod document;
pub mod flashcard;
pub mod node;
pub mod node_link;

#[macro_export]
macro_rules! app_commands {
    () => {{
        // use $crate::commands::features::collection::cmd as collection;
        use $crate::commands::document::cmd as docucment;
        use $crate::commands::flashcard::deck;
        use $crate::commands::node;
        use $crate::commands::node_link;

        tauri::generate_handler![
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
            node_link::create_link_with_metadata,
            // flashcard
            deck::get_decks,
            deck::get_cards_from_deck,
            deck::create_deck,
            // document
            docucment::create_document,
            docucment::update_document,
            // collection
            // collection::create_collection,
            // collection::create_property,
            // collection::get_collection,
            // collection::create_document_in_collection,
            // collection::get_documents_in_collection,
            // collection::update_document_property
        ]
    }};
}
