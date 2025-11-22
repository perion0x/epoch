module newsletter::newsletter {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::option::{Self, Option};

    // Error codes
    const ENotCreator: u64 = 1;
    const EInvalidAccessModel: u64 = 4;

    // Structs
    
    /// Represents the access model for a newsletter
    public struct AccessModel has store, copy, drop {
        is_free: bool,
        is_nft_gated: bool,
        is_hybrid: bool
    }

    /// Create a new AccessModel
    public fun new_access_model(is_free: bool, is_nft_gated: bool, is_hybrid: bool): AccessModel {
        AccessModel {
            is_free,
            is_nft_gated,
            is_hybrid
        }
    }

    /// Getter for is_free field
    public fun access_model_is_free(model: &AccessModel): bool {
        model.is_free
    }

    /// Getter for is_nft_gated field
    public fun access_model_is_nft_gated(model: &AccessModel): bool {
        model.is_nft_gated
    }

    /// Getter for is_hybrid field
    public fun access_model_is_hybrid(model: &AccessModel): bool {
        model.is_hybrid
    }

    /// Main Newsletter object
    public struct Newsletter has key, store {
        id: UID,
        creator: address,
        title: String,
        description: String,
        access_model: AccessModel,
        nft_collection: Option<address>,
        seal_package_id: address,
        created_at: u64,
        issue_count: u64
    }

    // Events
    
    /// Event emitted when a newsletter is created
    public struct NewsletterCreated has copy, drop {
        newsletter_id: address,
        creator: address,
        title: String,
        access_model: AccessModel
    }

    /// Event emitted when newsletter metadata is updated
    public struct NewsletterUpdated has copy, drop {
        newsletter_id: address,
        title: String,
        description: String
    }

    // Public functions
    
    /// Create a new newsletter
    public fun create_newsletter(
        title: String,
        description: String,
        access_model: AccessModel,
        nft_collection: Option<address>,
        seal_package_id: address,
        ctx: &mut TxContext
    ): Newsletter {
        let sender = tx_context::sender(ctx);
        let uid = object::new(ctx);
        let newsletter_id = object::uid_to_address(&uid);
        let created_at = tx_context::epoch_timestamp_ms(ctx);

        let newsletter = Newsletter {
            id: uid,
            creator: sender,
            title,
            description,
            access_model,
            nft_collection,
            seal_package_id,
            created_at,
            issue_count: 0
        };

        // Emit creation event
        event::emit(NewsletterCreated {
            newsletter_id,
            creator: sender,
            title: newsletter.title,
            access_model: newsletter.access_model
        });

        newsletter
    }

    /// Entry function to create and share a newsletter
    public entry fun create_and_share_newsletter(
        title: String,
        description: String,
        is_free: bool,
        is_nft_gated: bool,
        is_hybrid: bool,
        nft_collection: Option<address>,
        seal_package_id: address,
        ctx: &mut TxContext
    ) {
        let access_model = AccessModel {
            is_free,
            is_nft_gated,
            is_hybrid
        };

        let newsletter = create_newsletter(
            title,
            description,
            access_model,
            nft_collection,
            seal_package_id,
            ctx
        );

        transfer::public_share_object(newsletter);
    }

    /// Update newsletter metadata (title and description)
    public entry fun update_newsletter_metadata(
        newsletter: &mut Newsletter,
        title: String,
        description: String,
        ctx: &TxContext
    ) {
        // Verify caller is the creator
        assert!(newsletter.creator == tx_context::sender(ctx), ENotCreator);

        // Update mutable fields
        newsletter.title = title;
        newsletter.description = description;

        // Emit update event
        event::emit(NewsletterUpdated {
            newsletter_id: object::uid_to_address(&newsletter.id),
            title: newsletter.title,
            description: newsletter.description
        });
    }

    /// Increment issue count (called by issue module)
    public(package) fun increment_issue_count(newsletter: &mut Newsletter) {
        newsletter.issue_count = newsletter.issue_count + 1;
    }

    // Getter functions
    
    public fun get_creator(newsletter: &Newsletter): address {
        newsletter.creator
    }

    public fun get_title(newsletter: &Newsletter): String {
        newsletter.title
    }

    public fun get_description(newsletter: &Newsletter): String {
        newsletter.description
    }

    public fun get_access_model(newsletter: &Newsletter): AccessModel {
        newsletter.access_model
    }

    public fun get_nft_collection(newsletter: &Newsletter): Option<address> {
        newsletter.nft_collection
    }

    public fun get_seal_package_id(newsletter: &Newsletter): address {
        newsletter.seal_package_id
    }

    public fun get_created_at(newsletter: &Newsletter): u64 {
        newsletter.created_at
    }

    public fun get_issue_count(newsletter: &Newsletter): u64 {
        newsletter.issue_count
    }

    // AccessModel helper functions
    
    public fun is_free(access_model: &AccessModel): bool {
        access_model.is_free
    }

    public fun is_nft_gated(access_model: &AccessModel): bool {
        access_model.is_nft_gated
    }

    public fun is_hybrid(access_model: &AccessModel): bool {
        access_model.is_hybrid
    }
}
