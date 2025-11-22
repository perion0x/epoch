module newsletter::subscription {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::table::{Self, Table};
    use newsletter::newsletter::Newsletter;

    // Error codes
    const EAlreadySubscribed: u64 = 8;
    const ENotSubscribed: u64 = 9;

    // Structs

    /// Subscription object representing a user's subscription to a newsletter
    public struct Subscription has key, store {
        id: UID,
        subscriber: address,
        newsletter_id: ID,
        subscribed_at: u64
    }

    /// Registry to track subscriptions (shared object)
    public struct SubscriptionRegistry has key {
        id: UID,
        // Maps (subscriber, newsletter_id) -> subscription_id
        subscriptions: Table<vector<u8>, ID>
    }

    // Events

    /// Event emitted when a user subscribes to a newsletter
    public struct Subscribed has copy, drop {
        subscription_id: address,
        newsletter_id: ID,
        subscriber: address
    }

    /// Event emitted when a user unsubscribes from a newsletter
    public struct Unsubscribed has copy, drop {
        subscription_id: address,
        newsletter_id: ID,
        subscriber: address
    }

    // Initialization

    /// Initialize the subscription registry (called once on module publish)
    fun init(ctx: &mut TxContext) {
        let registry = SubscriptionRegistry {
            id: object::new(ctx),
            subscriptions: table::new(ctx)
        };
        transfer::share_object(registry);
    }

    // Public functions

    /// Subscribe to a newsletter
    public fun subscribe(
        newsletter: &Newsletter,
        ctx: &mut TxContext
    ): Subscription {
        let sender = tx_context::sender(ctx);
        let newsletter_id = object::id(newsletter);
        let subscribed_at = tx_context::epoch_timestamp_ms(ctx);

        let uid = object::new(ctx);
        let subscription_id = object::uid_to_address(&uid);

        let subscription = Subscription {
            id: uid,
            subscriber: sender,
            newsletter_id,
            subscribed_at
        };

        // Emit subscription event
        event::emit(Subscribed {
            subscription_id,
            newsletter_id,
            subscriber: sender
        });

        subscription
    }

    /// Entry function to subscribe and transfer subscription object to sender
    public entry fun subscribe_to_newsletter(
        newsletter: &Newsletter,
        ctx: &mut TxContext
    ) {
        let subscription = subscribe(newsletter, ctx);
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(subscription, sender);
    }

    /// Unsubscribe from a newsletter by deleting the subscription object
    public entry fun unsubscribe(
        subscription: Subscription,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let Subscription { id, subscriber, newsletter_id, subscribed_at: _ } = subscription;
        
        // Verify caller is the subscriber
        assert!(subscriber == sender, ENotSubscribed);

        let subscription_id = object::uid_to_address(&id);

        // Emit unsubscription event
        event::emit(Unsubscribed {
            subscription_id,
            newsletter_id,
            subscriber
        });

        // Delete the subscription object
        object::delete(id);
    }

    // Getter functions

    public fun get_subscriber(subscription: &Subscription): address {
        subscription.subscriber
    }

    public fun get_newsletter_id(subscription: &Subscription): ID {
        subscription.newsletter_id
    }

    public fun get_subscribed_at(subscription: &Subscription): u64 {
        subscription.subscribed_at
    }

    /// Verify that a subscription is for a specific newsletter
    public fun verify_subscription(subscription: &Subscription, newsletter_id: ID): bool {
        subscription.newsletter_id == newsletter_id
    }

    /// Check if a user is subscribed to a newsletter
    public fun is_subscribed(subscription: &Subscription, subscriber: address, newsletter_id: ID): bool {
        subscription.subscriber == subscriber && subscription.newsletter_id == newsletter_id
    }
}
