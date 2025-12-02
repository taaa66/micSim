<script lang="ts">
  /**
   * =============================================================================
   * SWAP MARKETPLACE COMPONENT
   * =============================================================================
   * View and manage shift swap listings
   * =============================================================================
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import type { SwapListing, ShiftAssignment, RotaUser, SwapValidation } from '../types';
  import { SHIFT_TYPES } from '../types';

  export let listings: SwapListing[] = [];
  export let myAssignments: ShiftAssignment[] = [];
  export let currentUser: RotaUser | null = null;
  export let onValidateSwap: ((listing: SwapListing, offeredAssignmentId?: string) => SwapValidation) | null = null;

  const dispatch = createEventDispatcher();

  let selectedListing: SwapListing | null = null;
  let selectedOfferAssignment: string | null = null;
  let validationResult: SwapValidation | null = null;
  let showMyListings: boolean = false;

  $: availableListings = listings.filter(l => 
    l.userId !== currentUser?.id && 
    l.status === 'available' &&
    new Date(l.expiresAt) > new Date()
  );

  $: myListings = listings.filter(l => l.userId === currentUser?.id);

  function getShiftConfig(shiftType: string) {
    return SHIFT_TYPES[shiftType as keyof typeof SHIFT_TYPES];
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTimeUntil(date: Date): string {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Expiring soon';
  }

  function selectListing(listing: SwapListing) {
    selectedListing = listing;
    selectedOfferAssignment = null;
    validationResult = null;
  }

  function validateAndPreview() {
    if (!selectedListing || !onValidateSwap) return;
    validationResult = onValidateSwap(selectedListing, selectedOfferAssignment || undefined);
  }

  function handleAcceptSwap() {
    if (!selectedListing) return;
    dispatch('acceptSwap', {
      listingId: selectedListing.id,
      offeredAssignmentId: selectedOfferAssignment
    });
    selectedListing = null;
    validationResult = null;
  }

  function handleListForSwap(assignment: ShiftAssignment) {
    dispatch('listForSwap', { assignmentId: assignment.id });
  }

  function handleCancelListing(listingId: string) {
    dispatch('cancelListing', { listingId });
  }
</script>

<div class="swap-marketplace" in:fly={{ y: 20, duration: 400 }}>
  <!-- Header -->
  <div class="marketplace-header">
    <h2>🔄 Swap Marketplace</h2>
    <div class="header-tabs">
      <button 
        class="tab-btn" 
        class:active={!showMyListings}
        on:click={() => showMyListings = false}
      >
        Available ({availableListings.length})
      </button>
      <button 
        class="tab-btn" 
        class:active={showMyListings}
        on:click={() => showMyListings = true}
      >
        My Listings ({myListings.length})
      </button>
    </div>
  </div>

  {#if !showMyListings}
    <!-- Available Swaps -->
    <div class="listings-grid">
      {#if availableListings.length === 0}
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <p>No shifts available for swap</p>
          <p class="empty-hint">Check back later or list your own shift</p>
        </div>
      {:else}
        {#each availableListings as listing, i}
          {@const config = getShiftConfig(listing.shiftType)}
          <button
            class="listing-card"
            class:selected={selectedListing?.id === listing.id}
            on:click={() => selectListing(listing)}
            in:fly={{ y: 20, delay: i * 50, duration: 300 }}
          >
            <div class="listing-header" style="border-color: {config.color}">
              <span class="shift-icon">{config.icon}</span>
              <span class="shift-type">{config.name}</span>
            </div>
            
            <div class="listing-details">
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{formatDate(listing.date)}</span>
              </div>
              <div class="detail-row">
                <span class="label">From:</span>
                <span class="value">{listing.userName}</span>
              </div>
              {#if listing.reason}
                <div class="detail-row">
                  <span class="label">Reason:</span>
                  <span class="value reason">{listing.reason}</span>
                </div>
              {/if}
            </div>

            <div class="listing-footer">
              <span class="expires">Expires in {formatTimeUntil(listing.expiresAt)}</span>
            </div>
          </button>
        {/each}
      {/if}
    </div>

    <!-- Swap Details Panel -->
    {#if selectedListing}
      <div class="swap-panel" in:fly={{ x: 20, duration: 300 }}>
        <h3>Accept Swap</h3>
        
        <div class="swap-info">
          <p>You will take:</p>
          <div class="swap-shift">
            <span class="icon">{getShiftConfig(selectedListing.shiftType).icon}</span>
            <span>{getShiftConfig(selectedListing.shiftType).name}</span>
            <span class="date">{formatDate(selectedListing.date)}</span>
          </div>
        </div>

        {#if myAssignments.length > 0}
          <div class="offer-section">
            <p>Offer one of your shifts in exchange (optional):</p>
            <div class="offer-options">
              <button
                class="offer-option"
                class:selected={selectedOfferAssignment === null}
                on:click={() => { selectedOfferAssignment = null; validationResult = null; }}
              >
                No exchange (just take the shift)
              </button>
              {#each myAssignments as assignment}
                {@const config = getShiftConfig(assignment.shiftType)}
                <button
                  class="offer-option"
                  class:selected={selectedOfferAssignment === assignment.id}
                  on:click={() => { selectedOfferAssignment = assignment.id; validationResult = null; }}
                >
                  <span class="icon">{config.icon}</span>
                  <span>{config.shortName}</span>
                  <span class="date">{formatDate(assignment.date)}</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <button class="validate-btn" on:click={validateAndPreview}>
          Check Eligibility
        </button>

        {#if validationResult}
          <div class="validation-result" class:valid={validationResult.isValid} in:scale={{ duration: 200 }}>
            {#if validationResult.isValid}
              <span class="status-icon">✓</span>
              <span class="status-text">You are eligible for this swap</span>
            {:else}
              <span class="status-icon">✗</span>
              <div class="errors">
                {#each validationResult.errors as error}
                  <p class="error">{error.message}</p>
                {/each}
              </div>
            {/if}
            
            {#if validationResult.warnings.length > 0}
              <div class="warnings">
                {#each validationResult.warnings as warning}
                  <p class="warning">⚠️ {warning.message}</p>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <div class="panel-actions">
          <button class="cancel-btn" on:click={() => selectedListing = null}>
            Cancel
          </button>
          <button 
            class="accept-btn" 
            disabled={!validationResult?.isValid}
            on:click={handleAcceptSwap}
          >
            Accept Swap
          </button>
        </div>
      </div>
    {/if}

  {:else}
    <!-- My Listings -->
    <div class="my-listings">
      <div class="list-shift-section">
        <h3>List a Shift for Swap</h3>
        <p class="hint">Select one of your upcoming shifts to list</p>
        
        <div class="my-shifts-grid">
          {#each myAssignments as assignment}
            {@const config = getShiftConfig(assignment.shiftType)}
            {@const isListed = myListings.some(l => l.assignmentId === assignment.id && l.status === 'available')}
            <div class="my-shift-card" class:listed={isListed}>
              <div class="shift-info">
                <span class="icon">{config.icon}</span>
                <span class="type">{config.name}</span>
                <span class="date">{formatDate(assignment.date)}</span>
              </div>
              {#if isListed}
                <span class="listed-badge">Listed</span>
              {:else}
                <button class="list-btn" on:click={() => handleListForSwap(assignment)}>
                  List for Swap
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      {#if myListings.length > 0}
        <div class="active-listings">
          <h3>Your Active Listings</h3>
          {#each myListings.filter(l => l.status === 'available') as listing}
            {@const config = getShiftConfig(listing.shiftType)}
            <div class="active-listing-card">
              <div class="listing-info">
                <span class="icon">{config.icon}</span>
                <span class="type">{config.name}</span>
                <span class="date">{formatDate(listing.date)}</span>
              </div>
              <div class="listing-meta">
                <span class="interested">{listing.interestedUsers.length} interested</span>
                <span class="expires">Expires {formatTimeUntil(listing.expiresAt)}</span>
              </div>
              <button class="cancel-listing-btn" on:click={() => handleCancelListing(listing.id)}>
                Cancel Listing
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .swap-marketplace {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .marketplace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .marketplace-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #e0f5f0;
  }

  .header-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-btn.active {
    background: rgba(15, 184, 159, 0.2);
    border-color: rgba(15, 184, 159, 0.3);
    color: #0fb89f;
  }

  .listings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #7aa8a0;
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .empty-hint {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .listing-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .listing-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .listing-card.selected {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .listing-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid;
  }

  .shift-icon {
    font-size: 1.5rem;
  }

  .shift-type {
    font-weight: 600;
    color: #e0f5f0;
  }

  .listing-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .label {
    color: #7aa8a0;
  }

  .value {
    color: #e0f5f0;
  }

  .value.reason {
    font-style: italic;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .listing-footer {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .expires {
    font-size: 0.75rem;
    color: #f59e0b;
  }

  /* Swap Panel */
  .swap-panel {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(15, 184, 159, 0.2);
  }

  .swap-panel h3 {
    margin: 0 0 1rem;
    color: #e0f5f0;
  }

  .swap-info {
    margin-bottom: 1rem;
  }

  .swap-info p {
    margin: 0 0 0.5rem;
    color: #7aa8a0;
    font-size: 0.9rem;
  }

  .swap-shift {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: #e0f5f0;
  }

  .swap-shift .icon {
    font-size: 1.5rem;
  }

  .swap-shift .date {
    margin-left: auto;
    color: #7aa8a0;
  }

  .offer-section {
    margin-bottom: 1rem;
  }

  .offer-section p {
    margin: 0 0 0.5rem;
    color: #7aa8a0;
    font-size: 0.9rem;
  }

  .offer-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .offer-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0f5f0;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .offer-option:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .offer-option.selected {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .offer-option .date {
    margin-left: auto;
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .validate-btn {
    width: 100%;
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #60a5fa;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1rem;
  }

  .validate-btn:hover {
    background: rgba(59, 130, 246, 0.3);
  }

  .validation-result {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .validation-result.valid {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .validation-result:not(.valid) {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .status-icon {
    font-size: 1.5rem;
  }

  .validation-result.valid .status-icon {
    color: #10b981;
  }

  .validation-result:not(.valid) .status-icon {
    color: #ef4444;
  }

  .status-text {
    color: #10b981;
    font-weight: 500;
  }

  .error {
    margin: 0;
    color: #ef4444;
    font-size: 0.9rem;
  }

  .warning {
    margin: 0;
    color: #f59e0b;
    font-size: 0.85rem;
  }

  .panel-actions {
    display: flex;
    gap: 1rem;
  }

  .cancel-btn {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
  }

  .accept-btn {
    flex: 2;
    padding: 0.75rem;
    background: linear-gradient(135deg, #0fb89f, #0d9488);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .accept-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .accept-btn:not(:disabled):hover {
    filter: brightness(1.1);
  }

  /* My Listings */
  .my-listings {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .list-shift-section h3,
  .active-listings h3 {
    margin: 0 0 0.5rem;
    color: #e0f5f0;
    font-size: 1.1rem;
  }

  .hint {
    margin: 0 0 1rem;
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .my-shifts-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .my-shift-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .my-shift-card.listed {
    opacity: 0.6;
  }

  .shift-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .shift-info .icon {
    font-size: 1.2rem;
  }

  .shift-info .type {
    color: #e0f5f0;
    font-weight: 500;
  }

  .shift-info .date {
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .listed-badge {
    padding: 0.25rem 0.75rem;
    background: rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    color: #f59e0b;
    font-size: 0.75rem;
  }

  .list-btn {
    padding: 0.5rem 1rem;
    background: rgba(15, 184, 159, 0.2);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 6px;
    color: #0fb89f;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .list-btn:hover {
    background: rgba(15, 184, 159, 0.3);
  }

  .active-listing-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .listing-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .listing-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: right;
  }

  .interested {
    color: #0fb89f;
    font-size: 0.85rem;
  }

  .cancel-listing-btn {
    padding: 0.5rem 1rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.85rem;
  }
</style>
