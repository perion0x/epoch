/**
 * Property-Based Tests for Newsletter Creation
 * 
 * Feature: decentralized-newsletter
 * 
 * These tests validate the correctness properties defined in the design document
 * using property-based testing with fast-check.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================================================
// Type Definitions (matching Move contract structures)
// ============================================================================

interface AccessModel {
  is_free: boolean;
  is_nft_gated: boolean;
  is_hybrid: boolean;
}

interface Newsletter {
  id: string;
  creator: string;
  title: string;
  description: string;
  access_model: AccessModel;
  nft_collection: string | null;
  seal_package_id: string;
  created_at: number;
  issue_count: number;
}

interface NewsletterCreatedEvent {
  newsletter_id: string;
  creator: string;
  title: string;
  access_model: AccessModel;
}

interface NewsletterUpdatedEvent {
  newsletter_id: string;
  title: string;
  description: string;
}

// ============================================================================
// Mock Implementation (simulating Move contract behavior)
// ============================================================================

class NewsletterContract {
  private newsletters: Map<string, Newsletter> = new Map();
  private events: Array<NewsletterCreatedEvent | NewsletterUpdatedEvent> = [];
  private nextId = 1;

  create_newsletter(
    title: string,
    description: string,
    access_model: AccessModel,
    nft_collection: string | null,
    seal_package_id: string,
    creator: string,
    timestamp: number = Date.now()
  ): Newsletter {
    const id = `newsletter_${this.nextId++}`;
    
    const newsletter: Newsletter = {
      id,
      creator,
      title,
      description,
      access_model,
      nft_collection,
      seal_package_id,
      created_at: timestamp,
      issue_count: 0
    };

    this.newsletters.set(id, newsletter);

    // Emit creation event
    this.events.push({
      newsletter_id: id,
      creator,
      title,
      access_model
    });

    return newsletter;
  }

  update_newsletter_metadata(
    newsletter_id: string,
    title: string,
    description: string,
    caller: string
  ): void {
    const newsletter = this.newsletters.get(newsletter_id);
    
    if (!newsletter) {
      throw new Error('Newsletter not found');
    }

    if (newsletter.creator !== caller) {
      throw new Error('Not creator');
    }

    newsletter.title = title;
    newsletter.description = description;

    // Emit update event
    this.events.push({
      newsletter_id,
      title,
      description
    });
  }

  get_newsletter(id: string): Newsletter | undefined {
    return this.newsletters.get(id);
  }

  get_events(): Array<NewsletterCreatedEvent | NewsletterUpdatedEvent> {
    return [...this.events];
  }

  clear(): void {
    this.newsletters.clear();
    this.events = [];
    this.nextId = 1;
  }
}

// ============================================================================
// Arbitraries (generators for property-based testing)
// ============================================================================

const addressArbitrary = fc.hexaString({ minLength: 40, maxLength: 40 });

const accessModelArbitrary = fc.oneof(
  // Free model
  fc.constant<AccessModel>({ is_free: true, is_nft_gated: false, is_hybrid: false }),
  // NFT-gated model
  fc.constant<AccessModel>({ is_free: false, is_nft_gated: true, is_hybrid: false }),
  // Hybrid model
  fc.constant<AccessModel>({ is_free: false, is_nft_gated: false, is_hybrid: true })
);

const titleArbitrary = fc.string({ minLength: 1, maxLength: 200 });
const descriptionArbitrary = fc.string({ minLength: 0, maxLength: 1000 });

const newsletterParamsArbitrary = fc.record({
  title: titleArbitrary,
  description: descriptionArbitrary,
  access_model: accessModelArbitrary,
  creator: addressArbitrary,
  seal_package_id: addressArbitrary,
  nft_collection: addressArbitrary,
  timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
});

// ============================================================================
// Property 1: Newsletter creation produces valid objects
// Feature: decentralized-newsletter, Property 1
// Validates: Requirements 1.1, 1.2
// ============================================================================

describe('Property 1: Newsletter creation produces valid objects', () => {
  it('should create newsletters with valid properties for any input', () => {
    fc.assert(
      fc.property(newsletterParamsArbitrary, (params) => {
        const contract = new NewsletterContract();
        
        const nft_collection = params.access_model.is_free ? null : params.nft_collection;
        
        const newsletter = contract.create_newsletter(
          params.title,
          params.description,
          params.access_model,
          nft_collection,
          params.seal_package_id,
          params.creator,
          params.timestamp
        );

        // Verify newsletter has valid properties
        expect(newsletter.id).toBeDefined();
        expect(newsletter.id).toMatch(/^newsletter_\d+$/);
        expect(newsletter.creator).toBe(params.creator);
        expect(newsletter.title).toBe(params.title);
        expect(newsletter.description).toBe(params.description);
        expect(newsletter.seal_package_id).toBe(params.seal_package_id);
        expect(newsletter.issue_count).toBe(0);
        expect(newsletter.created_at).toBe(params.timestamp);
        expect(newsletter.created_at).toBeGreaterThan(0);
        
        // Verify access model is preserved
        expect(newsletter.access_model).toEqual(params.access_model);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should create unique IDs for each newsletter', () => {
    fc.assert(
      fc.property(
        fc.array(newsletterParamsArbitrary, { minLength: 2, maxLength: 10 }),
        (paramsArray) => {
          const contract = new NewsletterContract();
          const ids = new Set<string>();

          for (const params of paramsArray) {
            const nft_collection = params.access_model.is_free ? null : params.nft_collection;
            
            const newsletter = contract.create_newsletter(
              params.title,
              params.description,
              params.access_model,
              nft_collection,
              params.seal_package_id,
              params.creator,
              params.timestamp
            );

            // Each newsletter should have a unique ID
            expect(ids.has(newsletter.id)).toBe(false);
            ids.add(newsletter.id);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should initialize issue_count to zero for all newsletters', () => {
    fc.assert(
      fc.property(newsletterParamsArbitrary, (params) => {
        const contract = new NewsletterContract();
        
        const nft_collection = params.access_model.is_free ? null : params.nft_collection;
        
        const newsletter = contract.create_newsletter(
          params.title,
          params.description,
          params.access_model,
          nft_collection,
          params.seal_package_id,
          params.creator,
          params.timestamp
        );

        expect(newsletter.issue_count).toBe(0);
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 2: NFT collection address is stored for gated newsletters
// Feature: decentralized-newsletter, Property 2
// Validates: Requirements 1.3
// ============================================================================

describe('Property 2: NFT collection address is stored for gated newsletters', () => {
  it('should store NFT collection for NFT-gated newsletters', () => {
    fc.assert(
      fc.property(
        titleArbitrary,
        descriptionArbitrary,
        addressArbitrary,
        addressArbitrary,
        addressArbitrary,
        (title, description, creator, nft_collection, seal_package_id) => {
          const contract = new NewsletterContract();
          
          const access_model: AccessModel = {
            is_free: false,
            is_nft_gated: true,
            is_hybrid: false
          };

          const newsletter = contract.create_newsletter(
            title,
            description,
            access_model,
            nft_collection,
            seal_package_id,
            creator
          );

          // NFT collection should be stored
          expect(newsletter.nft_collection).toBe(nft_collection);
          expect(newsletter.nft_collection).not.toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should store NFT collection for hybrid newsletters', () => {
    fc.assert(
      fc.property(
        titleArbitrary,
        descriptionArbitrary,
        addressArbitrary,
        addressArbitrary,
        addressArbitrary,
        (title, description, creator, nft_collection, seal_package_id) => {
          const contract = new NewsletterContract();
          
          const access_model: AccessModel = {
            is_free: false,
            is_nft_gated: false,
            is_hybrid: true
          };

          const newsletter = contract.create_newsletter(
            title,
            description,
            access_model,
            nft_collection,
            seal_package_id,
            creator
          );

          // NFT collection should be stored for hybrid model
          expect(newsletter.nft_collection).toBe(nft_collection);
          expect(newsletter.nft_collection).not.toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not store NFT collection for free newsletters', () => {
    fc.assert(
      fc.property(
        titleArbitrary,
        descriptionArbitrary,
        addressArbitrary,
        addressArbitrary,
        (title, description, creator, seal_package_id) => {
          const contract = new NewsletterContract();
          
          const access_model: AccessModel = {
            is_free: true,
            is_nft_gated: false,
            is_hybrid: false
          };

          const newsletter = contract.create_newsletter(
            title,
            description,
            access_model,
            null, // No NFT collection for free newsletters
            seal_package_id,
            creator
          );

          // NFT collection should be null for free newsletters
          expect(newsletter.nft_collection).toBeNull();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly associate NFT collection with access model', () => {
    fc.assert(
      fc.property(newsletterParamsArbitrary, (params) => {
        const contract = new NewsletterContract();
        
        const nft_collection = params.access_model.is_free ? null : params.nft_collection;
        
        const newsletter = contract.create_newsletter(
          params.title,
          params.description,
          params.access_model,
          nft_collection,
          params.seal_package_id,
          params.creator
        );

        // Verify the relationship between access model and NFT collection
        if (params.access_model.is_free) {
          expect(newsletter.nft_collection).toBeNull();
        } else {
          expect(newsletter.nft_collection).not.toBeNull();
          expect(newsletter.nft_collection).toBe(params.nft_collection);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 3: Newsletter creation emits events
// Feature: decentralized-newsletter, Property 3
// Validates: Requirements 1.4
// ============================================================================

describe('Property 3: Newsletter creation emits events', () => {
  it('should emit NewsletterCreated event for any newsletter creation', () => {
    fc.assert(
      fc.property(newsletterParamsArbitrary, (params) => {
        const contract = new NewsletterContract();
        
        const nft_collection = params.access_model.is_free ? null : params.nft_collection;
        
        const initialEventCount = contract.get_events().length;
        
        const newsletter = contract.create_newsletter(
          params.title,
          params.description,
          params.access_model,
          nft_collection,
          params.seal_package_id,
          params.creator
        );

        const events = contract.get_events();
        
        // Should have emitted exactly one new event
        expect(events.length).toBe(initialEventCount + 1);
        
        const event = events[events.length - 1] as NewsletterCreatedEvent;
        
        // Verify event contains correct data
        expect(event.newsletter_id).toBe(newsletter.id);
        expect(event.creator).toBe(params.creator);
        expect(event.title).toBe(params.title);
        expect(event.access_model).toEqual(params.access_model);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should emit one event per newsletter creation', () => {
    fc.assert(
      fc.property(
        fc.array(newsletterParamsArbitrary, { minLength: 1, maxLength: 10 }),
        (paramsArray) => {
          const contract = new NewsletterContract();
          
          for (let i = 0; i < paramsArray.length; i++) {
            const params = paramsArray[i];
            const nft_collection = params.access_model.is_free ? null : params.nft_collection;
            
            contract.create_newsletter(
              params.title,
              params.description,
              params.access_model,
              nft_collection,
              params.seal_package_id,
              params.creator
            );

            // Should have emitted exactly i+1 events
            expect(contract.get_events().length).toBe(i + 1);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include all required metadata in events', () => {
    fc.assert(
      fc.property(newsletterParamsArbitrary, (params) => {
        const contract = new NewsletterContract();
        
        const nft_collection = params.access_model.is_free ? null : params.nft_collection;
        
        contract.create_newsletter(
          params.title,
          params.description,
          params.access_model,
          nft_collection,
          params.seal_package_id,
          params.creator
        );

        const events = contract.get_events();
        const event = events[events.length - 1] as NewsletterCreatedEvent;
        
        // All required fields should be present
        expect(event.newsletter_id).toBeDefined();
        expect(event.creator).toBeDefined();
        expect(event.title).toBeDefined();
        expect(event.access_model).toBeDefined();
        expect(event.access_model.is_free).toBeDefined();
        expect(event.access_model.is_nft_gated).toBeDefined();
        expect(event.access_model.is_hybrid).toBeDefined();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 4: Newsletter updates preserve identity
// Feature: decentralized-newsletter, Property 4
// Validates: Requirements 1.5
// ============================================================================

describe('Property 4: Newsletter updates preserve identity', () => {
  it('should preserve immutable fields when updating metadata', () => {
    fc.assert(
      fc.property(
        newsletterParamsArbitrary,
        titleArbitrary,
        descriptionArbitrary,
        (createParams, newTitle, newDescription) => {
          const contract = new NewsletterContract();
          
          const nft_collection = createParams.access_model.is_free 
            ? null 
            : createParams.nft_collection;
          
          // Create newsletter
          const newsletter = contract.create_newsletter(
            createParams.title,
            createParams.description,
            createParams.access_model,
            nft_collection,
            createParams.seal_package_id,
            createParams.creator,
            createParams.timestamp
          );

          // Store original immutable properties
          const originalId = newsletter.id;
          const originalCreator = newsletter.creator;
          const originalSealPackageId = newsletter.seal_package_id;
          const originalCreatedAt = newsletter.created_at;
          const originalIssueCount = newsletter.issue_count;
          const originalAccessModel = { ...newsletter.access_model };
          const originalNftCollection = newsletter.nft_collection;

          // Update metadata
          contract.update_newsletter_metadata(
            newsletter.id,
            newTitle,
            newDescription,
            createParams.creator
          );

          const updatedNewsletter = contract.get_newsletter(newsletter.id)!;

          // Verify mutable fields changed
          expect(updatedNewsletter.title).toBe(newTitle);
          expect(updatedNewsletter.description).toBe(newDescription);

          // Verify immutable fields preserved
          expect(updatedNewsletter.id).toBe(originalId);
          expect(updatedNewsletter.creator).toBe(originalCreator);
          expect(updatedNewsletter.seal_package_id).toBe(originalSealPackageId);
          expect(updatedNewsletter.created_at).toBe(originalCreatedAt);
          expect(updatedNewsletter.issue_count).toBe(originalIssueCount);
          expect(updatedNewsletter.access_model).toEqual(originalAccessModel);
          expect(updatedNewsletter.nft_collection).toBe(originalNftCollection);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should emit update event when metadata is changed', () => {
    fc.assert(
      fc.property(
        newsletterParamsArbitrary,
        titleArbitrary,
        descriptionArbitrary,
        (createParams, newTitle, newDescription) => {
          const contract = new NewsletterContract();
          
          const nft_collection = createParams.access_model.is_free 
            ? null 
            : createParams.nft_collection;
          
          const newsletter = contract.create_newsletter(
            createParams.title,
            createParams.description,
            createParams.access_model,
            nft_collection,
            createParams.seal_package_id,
            createParams.creator
          );

          const eventCountBeforeUpdate = contract.get_events().length;

          contract.update_newsletter_metadata(
            newsletter.id,
            newTitle,
            newDescription,
            createParams.creator
          );

          const events = contract.get_events();
          
          // Should have emitted one new event
          expect(events.length).toBe(eventCountBeforeUpdate + 1);
          
          const updateEvent = events[events.length - 1] as NewsletterUpdatedEvent;
          expect(updateEvent.newsletter_id).toBe(newsletter.id);
          expect(updateEvent.title).toBe(newTitle);
          expect(updateEvent.description).toBe(newDescription);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject updates from non-creator', () => {
    fc.assert(
      fc.property(
        newsletterParamsArbitrary,
        addressArbitrary,
        titleArbitrary,
        descriptionArbitrary,
        (createParams, nonCreator, newTitle, newDescription) => {
          // Ensure non-creator is different from creator
          fc.pre(nonCreator !== createParams.creator);
          
          const contract = new NewsletterContract();
          
          const nft_collection = createParams.access_model.is_free 
            ? null 
            : createParams.nft_collection;
          
          const newsletter = contract.create_newsletter(
            createParams.title,
            createParams.description,
            createParams.access_model,
            nft_collection,
            createParams.seal_package_id,
            createParams.creator
          );

          // Attempt to update from non-creator should throw
          expect(() => {
            contract.update_newsletter_metadata(
              newsletter.id,
              newTitle,
              newDescription,
              nonCreator
            );
          }).toThrow('Not creator');
          
          // Verify newsletter unchanged
          const unchangedNewsletter = contract.get_newsletter(newsletter.id)!;
          expect(unchangedNewsletter.title).toBe(createParams.title);
          expect(unchangedNewsletter.description).toBe(createParams.description);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow multiple updates while preserving identity', () => {
    fc.assert(
      fc.property(
        newsletterParamsArbitrary,
        fc.array(
          fc.record({
            title: titleArbitrary,
            description: descriptionArbitrary
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (createParams, updates) => {
          const contract = new NewsletterContract();
          
          const nft_collection = createParams.access_model.is_free 
            ? null 
            : createParams.nft_collection;
          
          const newsletter = contract.create_newsletter(
            createParams.title,
            createParams.description,
            createParams.access_model,
            nft_collection,
            createParams.seal_package_id,
            createParams.creator
          );

          const originalId = newsletter.id;
          const originalCreator = newsletter.creator;
          const originalCreatedAt = newsletter.created_at;

          // Apply multiple updates
          for (const update of updates) {
            contract.update_newsletter_metadata(
              newsletter.id,
              update.title,
              update.description,
              createParams.creator
            );
          }

          const finalNewsletter = contract.get_newsletter(newsletter.id)!;

          // Identity should be preserved through all updates
          expect(finalNewsletter.id).toBe(originalId);
          expect(finalNewsletter.creator).toBe(originalCreator);
          expect(finalNewsletter.created_at).toBe(originalCreatedAt);
          
          // Final values should match last update
          const lastUpdate = updates[updates.length - 1];
          expect(finalNewsletter.title).toBe(lastUpdate.title);
          expect(finalNewsletter.description).toBe(lastUpdate.description);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
