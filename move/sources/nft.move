module newsletter::nft {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use newsletter::newsletter::{Self, Newsletter};

    // Error codes
    const ENotCreator: u64 = 1;
    const EInvalidNFT: u64 = 6;

    // Structs

    /// NFT that grants access to premium newsletter content
    public struct NewsletterAccessNFT has key, store {
        id: UID,
        newsletter_id: ID,
        access_level: u8,
        issued_at: u64
    }

    // Events

    /// Event emitted when an access NFT is minted
    public struct NFTMinted has copy, drop {
        nft_id: address,
        newsletter_id: ID,
        recipient: address
    }

    /// Event emitted when an NFT is transferred
    public struct NFTTransferred has copy, drop {
        nft_id: address,
        from: address,
        to: address
    }

    // Public functions

    /// Mint a new access NFT for a newsletter
    public fun mint_access_nft(
        newsletter: &Newsletter,
        recipient: address,
        access_level: u8,
        ctx: &mut TxContext
    ): NewsletterAccessNFT {
        let sender = tx_context::sender(ctx);
        
        // Verify caller is the newsletter creator
        assert!(newsletter::get_creator(newsletter) == sender, ENotCreator);

        let uid = object::new(ctx);
        let nft_id = object::uid_to_address(&uid);
        let newsletter_id = object::id(newsletter);
        let issued_at = tx_context::epoch_timestamp_ms(ctx);

        let nft = NewsletterAccessNFT {
            id: uid,
            newsletter_id,
            access_level,
            issued_at
        };

        // Emit minting event
        event::emit(NFTMinted {
            nft_id,
            newsletter_id,
            recipient
        });

        nft
    }

    /// Entry function to mint and transfer an access NFT
    public entry fun mint_and_transfer_nft(
        newsletter: &Newsletter,
        recipient: address,
        access_level: u8,
        ctx: &mut TxContext
    ) {
        let nft = mint_access_nft(newsletter, recipient, access_level, ctx);
        transfer::public_transfer(nft, recipient);
    }

    /// Transfer an NFT to a new owner
    public entry fun transfer_nft(
        nft: NewsletterAccessNFT,
        recipient: address,
        ctx: &TxContext
    ) {
        let nft_id = object::uid_to_address(&nft.id);
        let sender = tx_context::sender(ctx);

        // Emit transfer event
        event::emit(NFTTransferred {
            nft_id,
            from: sender,
            to: recipient
        });

        transfer::public_transfer(nft, recipient);
    }

    // Getter functions

    public fun get_newsletter_id(nft: &NewsletterAccessNFT): ID {
        nft.newsletter_id
    }

    public fun get_access_level(nft: &NewsletterAccessNFT): u8 {
        nft.access_level
    }

    public fun get_issued_at(nft: &NewsletterAccessNFT): u64 {
        nft.issued_at
    }

    /// Verify that an NFT grants access to a specific newsletter
    public fun verify_access(nft: &NewsletterAccessNFT, newsletter_id: ID): bool {
        nft.newsletter_id == newsletter_id
    }
}
