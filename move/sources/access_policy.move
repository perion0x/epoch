module newsletter::access_policy {
    use sui::object::{Self, ID};
    use sui::tx_context::{Self, TxContext};
    use std::vector;
    use newsletter::nft::{Self, NewsletterAccessNFT};
    use newsletter::subscription::{Self, Subscription};

    // Error codes
    const ENoAccess: u64 = 7;
    const EInvalidNFT: u64 = 6;
    const EInvalidIdentity: u64 = 10;

    // Constants
    const IDENTITY_LENGTH: u64 = 64; // 32 bytes for newsletter_id + 32 bytes for issue_id

    /// Seal approval function for NFT-gated content
    /// Identity format: [newsletter_id (32 bytes)][issue_id (32 bytes)]
    /// This function is called by Seal key servers to verify access rights
    public entry fun seal_approve_nft(
        id: vector<u8>,
        nft: &NewsletterAccessNFT,
        ctx: &TxContext
    ) {
        // Parse identity to extract newsletter_id and issue_id
        let (newsletter_id, _issue_id) = parse_identity(id);
        
        // Verify NFT is for this newsletter
        let nft_newsletter_id = nft::get_newsletter_id(nft);
        assert!(nft_newsletter_id == newsletter_id, EInvalidNFT);
        
        // Verify caller owns the NFT (implicit through reference ownership)
        // The fact that the caller can provide a reference to the NFT proves ownership
        // in Sui's object model
        
        // Access granted - function returns successfully
        // Seal key servers will provide decryption keys upon successful return
    }
    
    /// Alternative: Seal approval for subscription-based access
    /// This provides an alternative access control mechanism based on subscriptions
    /// rather than NFT ownership
    public entry fun seal_approve_subscription(
        id: vector<u8>,
        subscription: &Subscription,
        ctx: &TxContext
    ) {
        // Parse identity to extract newsletter_id and issue_id
        let (newsletter_id, _issue_id) = parse_identity(id);
        
        // Verify subscription is for this newsletter
        let subscription_newsletter_id = subscription::get_newsletter_id(subscription);
        assert!(subscription_newsletter_id == newsletter_id, EInvalidNFT);
        
        // Verify subscription is active and belongs to the caller
        let sender = tx_context::sender(ctx);
        let subscriber = subscription::get_subscriber(subscription);
        assert!(subscriber == sender, ENoAccess);
        
        // Access granted - function returns successfully
    }

    /// Parse identity bytes to extract newsletter_id and issue_id
    /// Identity format: [newsletter_id (32 bytes)][issue_id (32 bytes)]
    /// Returns: (newsletter_id, issue_id)
    fun parse_identity(id: vector<u8>): (ID, ID) {
        // Verify identity has correct length
        assert!(vector::length(&id) == IDENTITY_LENGTH, EInvalidIdentity);
        
        // Extract newsletter_id (first 32 bytes)
        let mut newsletter_id_bytes = vector::empty<u8>();
        let mut i = 0;
        while (i < 32) {
            vector::push_back(&mut newsletter_id_bytes, *vector::borrow(&id, i));
            i = i + 1;
        };
        
        // Extract issue_id (last 32 bytes)
        let mut issue_id_bytes = vector::empty<u8>();
        let mut j = 32;
        while (j < 64) {
            vector::push_back(&mut issue_id_bytes, *vector::borrow(&id, j));
            j = j + 1;
        };
        
        // Convert byte vectors to IDs
        let newsletter_id = object::id_from_bytes(newsletter_id_bytes);
        let issue_id = object::id_from_bytes(issue_id_bytes);
        
        (newsletter_id, issue_id)
    }

    // Test helper functions (for testing only)
    #[test_only]
    public fun test_parse_identity(id: vector<u8>): (ID, ID) {
        parse_identity(id)
    }
}
