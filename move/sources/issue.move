module newsletter::issue {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use newsletter::newsletter::{Self, Newsletter};

    // Error codes
    const ENotCreator: u64 = 1;
    const ENewsletterNotFound: u64 = 2;

    // Structs

    /// Represents a byte range in content
    public struct Range has store, copy, drop {
        start: u64,
        end: u64
    }

    /// Defines boundaries between public and encrypted content
    public struct ContentBoundaries has store, copy, drop {
        public_ranges: vector<Range>,
        encrypted_ranges: vector<Range>
    }

    /// Main Issue object
    public struct Issue has key, store {
        id: UID,
        newsletter_id: ID,
        title: String,
        walrus_blob_id: vector<u8>,
        content_boundaries: ContentBoundaries,
        published_at: u64,
        has_premium: bool
    }

    // Events

    /// Event emitted when an issue is published
    public struct IssuePublished has copy, drop {
        issue_id: address,
        newsletter_id: ID,
        walrus_blob_id: vector<u8>,
        has_premium: bool,
        published_at: u64
    }

    // Public functions

    /// Publish a new issue for a newsletter
    public fun publish_issue(
        newsletter: &mut Newsletter,
        title: String,
        walrus_blob_id: vector<u8>,
        content_boundaries: ContentBoundaries,
        has_premium: bool,
        ctx: &mut TxContext
    ): Issue {
        let sender = tx_context::sender(ctx);
        
        // Verify caller is the newsletter creator
        assert!(newsletter::get_creator(newsletter) == sender, ENotCreator);

        let uid = object::new(ctx);
        let issue_id = object::uid_to_address(&uid);
        let newsletter_id = object::id(newsletter);
        let published_at = tx_context::epoch_timestamp_ms(ctx);

        let issue = Issue {
            id: uid,
            newsletter_id,
            title,
            walrus_blob_id,
            content_boundaries,
            published_at,
            has_premium
        };

        // Increment the newsletter's issue count
        newsletter::increment_issue_count(newsletter);

        // Emit publication event
        event::emit(IssuePublished {
            issue_id,
            newsletter_id,
            walrus_blob_id: issue.walrus_blob_id,
            has_premium,
            published_at
        });

        issue
    }

    /// Entry function to publish and share an issue
    public entry fun publish_and_share_issue(
        newsletter: &mut Newsletter,
        title: String,
        walrus_blob_id: vector<u8>,
        public_ranges_start: vector<u64>,
        public_ranges_end: vector<u64>,
        encrypted_ranges_start: vector<u64>,
        encrypted_ranges_end: vector<u64>,
        has_premium: bool,
        ctx: &mut TxContext
    ) {
        // Build Range vectors
        let public_ranges = build_ranges(public_ranges_start, public_ranges_end);
        let encrypted_ranges = build_ranges(encrypted_ranges_start, encrypted_ranges_end);

        let content_boundaries = ContentBoundaries {
            public_ranges,
            encrypted_ranges
        };

        let issue = publish_issue(
            newsletter,
            title,
            walrus_blob_id,
            content_boundaries,
            has_premium,
            ctx
        );

        transfer::public_share_object(issue);
    }

    // Helper functions

    /// Build a vector of Range structs from start and end vectors
    fun build_ranges(starts: vector<u64>, ends: vector<u64>): vector<Range> {
        let mut ranges = vector::empty<Range>();
        let len = vector::length(&starts);
        let mut i = 0;
        
        while (i < len) {
            let range = Range {
                start: *vector::borrow(&starts, i),
                end: *vector::borrow(&ends, i)
            };
            vector::push_back(&mut ranges, range);
            i = i + 1;
        };

        ranges
    }

    // Getter functions

    public fun get_newsletter_id(issue: &Issue): ID {
        issue.newsletter_id
    }

    public fun get_title(issue: &Issue): String {
        issue.title
    }

    public fun get_walrus_blob_id(issue: &Issue): vector<u8> {
        issue.walrus_blob_id
    }

    public fun get_content_boundaries(issue: &Issue): ContentBoundaries {
        issue.content_boundaries
    }

    public fun get_published_at(issue: &Issue): u64 {
        issue.published_at
    }

    public fun has_premium_content(issue: &Issue): bool {
        issue.has_premium
    }

    // ContentBoundaries helper functions

    public fun get_public_ranges(boundaries: &ContentBoundaries): vector<Range> {
        boundaries.public_ranges
    }

    public fun get_encrypted_ranges(boundaries: &ContentBoundaries): vector<Range> {
        boundaries.encrypted_ranges
    }

    // Range helper functions

    public fun get_range_start(range: &Range): u64 {
        range.start
    }

    public fun get_range_end(range: &Range): u64 {
        range.end
    }
}
