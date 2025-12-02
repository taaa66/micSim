<script lang="ts">
  /**
   * =============================================================================
   * ROTA HUB - MAIN COMPONENT
   * =============================================================================
   * Central hub for all rota management features
   * =============================================================================
   */
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  import RotaCalendar from './RotaCalendar.svelte';
  import PreferenceInput from './PreferenceInput.svelte';
  import SwapMarketplace from './SwapMarketplace.svelte';
  
  import {
    currentRotaUser,
    rotaUsers,
    currentSchedule,
    userPreferences,
    swapListings,
    selectedMonth,
    selectedYear,
    isLoading,
    error,
    myAssignments,
    nextShift,
    myFairnessScore,
    availableSwaps,
    initializeRota,
    generateSchedule,
    submitPreferences,
    listShiftForSwap,
    acceptSwap,
    cancelSwapListing,
    submitSatisfactionScore
  } from '../rotaStore';
  
  import { SHIFT_TYPES } from '../types';
  import { validateSwap } from '../swapService';

  export let onBack: (() => void) | null = null;
  export let userId: string = 'user-1';

  const dispatch = createEventDispatcher();

  let activeView: 'calendar' | 'swap' | 'admin' = 'calendar';
  let showPreferenceModal: boolean = false;
  let showSatisfactionModal: boolean = false;
  let satisfactionScore: number = 0;
  let satisfactionFeedback: string = '';

  onMount(async () => {
    await initializeRota(userId);
  });

  function handlePrevMonth() {
    if ($selectedMonth === 1) {
      selectedMonth.set(12);
      selectedYear.update(y => y - 1);
    } else {
      selectedMonth.update(m => m - 1);
    }
    generateSchedule($selectedMonth, $selectedYear);
  }

  function handleNextMonth() {
    if ($selectedMonth === 12) {
      selectedMonth.set(1);
      selectedYear.update(y => y + 1);
    } else {
      selectedMonth.update(m => m + 1);
    }
    generateSchedule($selectedMonth, $selectedYear);
  }

  function handlePreferenceSubmit(event: CustomEvent) {
    submitPreferences(event.detail);
    showPreferenceModal = false;
  }

  async function handleAcceptSwap(event: CustomEvent) {
    const { listingId, offeredAssignmentId } = event.detail;
    const result = await acceptSwap(listingId, offeredAssignmentId);
    
    if (!result.success) {
      // Show error toast
      console.error(result.message);
    }
  }

  function handleListForSwap(event: CustomEvent) {
    const { assignmentId } = event.detail;
    listShiftForSwap(assignmentId, 'Personal commitment');
  }

  function handleCancelListing(event: CustomEvent) {
    const { listingId } = event.detail;
    cancelSwapListing(listingId);
  }

  function handleValidateSwap(listing: any, offeredAssignmentId?: string) {
    if (!$currentRotaUser || !$currentSchedule) return { isValid: false, errors: [], warnings: [] };
    
    const offeredAssignment = offeredAssignmentId 
      ? $currentSchedule.assignments.find(a => a.id === offeredAssignmentId)
      : null;
    
    return validateSwap(
      listing,
      $currentRotaUser,
      offeredAssignment || null,
      $currentSchedule.assignments,
      $rotaUsers
    );
  }

  function handleSubmitSatisfaction() {
    submitSatisfactionScore(satisfactionScore, satisfactionFeedback);
    showSatisfactionModal = false;
    satisfactionScore = 0;
    satisfactionFeedback = '';
  }

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

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }
</script>

<div class="rota-hub">
  <!-- Header -->
  <header class="rota-header" in:fly={{ y: -20, duration: 400 }}>
    <button class="back-btn" on:click={handleBack}>← Back</button>
    <div class="header-content">
      <h1>📅 My Shifts</h1>
      <p>Rota Management & Scheduling</p>
    </div>
    <div class="header-actions">
      <button class="pref-btn" on:click={() => showPreferenceModal = true}>
        ⚙️ Submit Preferences
      </button>
    </div>
  </header>

  {#if $isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading schedule...</p>
    </div>
  {:else if $error}
    <div class="error-state">
      <p>⚠️ {$error}</p>
      <button on:click={() => initializeRota(userId)}>Retry</button>
    </div>
  {:else}
    <!-- Quick Stats -->
    <div class="quick-stats" in:fly={{ y: 20, duration: 400, delay: 100 }}>
      <!-- Next Shift Card -->
      <div class="stat-card next-shift">
        <span class="stat-icon">⏰</span>
        <div class="stat-content">
          <span class="stat-label">Next Shift</span>
          {#if $nextShift}
            {@const config = getShiftConfig($nextShift.shiftType)}
            <span class="stat-value">
              {config.icon} {config.shortName}
            </span>
            <span class="stat-detail">{formatDate($nextShift.date)}</span>
          {:else}
            <span class="stat-value">None scheduled</span>
          {/if}
        </div>
      </div>

      <!-- Fairness Score Card -->
      <div class="stat-card fairness">
        <span class="stat-icon">⚖️</span>
        <div class="stat-content">
          <span class="stat-label">Fairness Index</span>
          <span class="stat-value" class:high={($myFairnessScore || 0) >= 80} class:low={($myFairnessScore || 0) < 60}>
            {$myFairnessScore?.toFixed(0) || '--'}%
          </span>
          <span class="stat-detail">
            {#if ($myFairnessScore || 0) >= 80}High Equity
            {:else if ($myFairnessScore || 0) >= 60}Balanced
            {:else}Review Needed
            {/if}
          </span>
        </div>
      </div>

      <!-- This Month Card -->
      <div class="stat-card monthly">
        <span class="stat-icon">📊</span>
        <div class="stat-content">
          <span class="stat-label">This Month</span>
          <span class="stat-value">{$myAssignments.length} shifts</span>
          <span class="stat-detail">
            {$myAssignments.filter(a => new Date(a.date).getDay() === 0 || new Date(a.date).getDay() === 6).length} weekend
          </span>
        </div>
      </div>

      <!-- Swaps Available Card -->
      <div class="stat-card swaps">
        <span class="stat-icon">🔄</span>
        <div class="stat-content">
          <span class="stat-label">Swap Market</span>
          <span class="stat-value">{$availableSwaps.length} available</span>
          <span class="stat-detail clickable" on:click={() => activeView = 'swap'}>
            View all →
          </span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="view-tabs" in:fly={{ y: 20, duration: 400, delay: 150 }}>
      <button 
        class="view-tab" 
        class:active={activeView === 'calendar'}
        on:click={() => activeView = 'calendar'}
      >
        📅 Calendar
      </button>
      <button 
        class="view-tab" 
        class:active={activeView === 'swap'}
        on:click={() => activeView = 'swap'}
      >
        🔄 Swap Market
        {#if $availableSwaps.length > 0}
          <span class="badge">{$availableSwaps.length}</span>
        {/if}
      </button>
      {#if $currentRotaUser?.role === 'admin' || $currentRotaUser?.role === 'supervisor'}
        <button 
          class="view-tab" 
          class:active={activeView === 'admin'}
          on:click={() => activeView = 'admin'}
        >
          ⚙️ Admin
        </button>
      {/if}
    </div>

    <!-- Main Content -->
    <div class="main-content">
      {#if activeView === 'calendar'}
        {#if $currentSchedule}
          <RotaCalendar
            assignments={$currentSchedule.assignments}
            users={$rotaUsers}
            month={$selectedMonth}
            year={$selectedYear}
            currentUserId={$currentRotaUser?.id || ''}
            on:prevMonth={handlePrevMonth}
            on:nextMonth={handleNextMonth}
            on:shiftClick={(e) => console.log('Shift clicked:', e.detail)}
          />
        {/if}

      {:else if activeView === 'swap'}
        <SwapMarketplace
          listings={$swapListings}
          myAssignments={$myAssignments}
          currentUser={$currentRotaUser}
          onValidateSwap={handleValidateSwap}
          on:acceptSwap={handleAcceptSwap}
          on:listForSwap={handleListForSwap}
          on:cancelListing={handleCancelListing}
        />

      {:else if activeView === 'admin'}
        <div class="admin-panel" in:fly={{ y: 20, duration: 300 }}>
          <h2>📊 Schedule Generation Log</h2>
          
          {#if $currentSchedule}
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Fairness Score</h3>
                <span class="metric-value">{$currentSchedule.fairnessMetrics.overallScore.toFixed(1)}%</span>
              </div>
              <div class="metric-card">
                <h3>Preference Fulfillment</h3>
                <span class="metric-value">{$currentSchedule.preferenceMetrics.overallFulfillment.toFixed(1)}%</span>
              </div>
              <div class="metric-card">
                <h3>Must-Have Met</h3>
                <span class="metric-value">
                  {$currentSchedule.preferenceMetrics.mustHaveFulfilled}/{$currentSchedule.preferenceMetrics.mustHaveTotal}
                </span>
              </div>
              <div class="metric-card">
                <h3>Must-Avoid Violations</h3>
                <span class="metric-value warning">
                  {$currentSchedule.preferenceMetrics.mustAvoidViolations}
                </span>
              </div>
            </div>

            <div class="generation-log">
              <h3>Generation Log</h3>
              <div class="log-entries">
                {#each $currentSchedule.generationLog.slice(-20) as entry}
                  <div class="log-entry" class:warning={entry.level === 'warning'} class:decision={entry.level === 'decision'}>
                    <span class="log-level">[{entry.level.toUpperCase()}]</span>
                    <span class="log-message">{entry.message}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="satisfaction-section">
              <h3>Satisfaction Tracking</h3>
              <p>Collected: {$currentSchedule.satisfactionScores.length} responses</p>
              {#if $currentSchedule.satisfactionScores.length > 0}
                <p>Average: {($currentSchedule.satisfactionScores.reduce((s, r) => s + r.score, 0) / $currentSchedule.satisfactionScores.length).toFixed(1)}/5</p>
              {/if}
              <button class="feedback-btn" on:click={() => showSatisfactionModal = true}>
                Submit Feedback
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Preference Modal -->
  <PreferenceInput
    bind:isOpen={showPreferenceModal}
    month={$selectedMonth}
    year={$selectedYear}
    userId={$currentRotaUser?.id || ''}
    existingPreferences={$userPreferences}
    on:submit={handlePreferenceSubmit}
    on:close={() => showPreferenceModal = false}
  />

  <!-- Satisfaction Modal -->
  {#if showSatisfactionModal}
    <div class="modal-overlay" on:click={() => showSatisfactionModal = false}>
      <div class="satisfaction-modal" on:click|stopPropagation in:scale={{ duration: 200 }}>
        <h3>Rate This Schedule</h3>
        <p>How satisfied are you with this month's rota?</p>
        
        <div class="rating-stars">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              class="star"
              class:active={satisfactionScore >= star}
              on:click={() => satisfactionScore = star}
            >
              ★
            </button>
          {/each}
        </div>
        
        <textarea
          bind:value={satisfactionFeedback}
          placeholder="Any additional feedback..."
          rows="3"
        ></textarea>
        
        <div class="modal-actions">
          <button class="cancel" on:click={() => showSatisfactionModal = false}>Cancel</button>
          <button class="submit" on:click={handleSubmitSatisfaction} disabled={satisfactionScore === 0}>
            Submit
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .rota-hub {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1015 0%, #151f28 100%);
    padding: 1.5rem;
    color: #e0f5f0;
  }

  .rota-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0f5f0;
  }

  .header-content {
    flex: 1;
  }

  .header-content h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .header-content p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .pref-btn {
    padding: 0.5rem 1rem;
    background: rgba(15, 184, 159, 0.2);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 8px;
    color: #0fb89f;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pref-btn:hover {
    background: rgba(15, 184, 159, 0.3);
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #7aa8a0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(15, 184, 159, 0.2);
    border-top-color: #0fb89f;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #7aa8a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .stat-value.high {
    color: #10b981;
  }

  .stat-value.low {
    color: #ef4444;
  }

  .stat-detail {
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .stat-detail.clickable {
    color: #0fb89f;
    cursor: pointer;
  }

  .stat-detail.clickable:hover {
    text-decoration: underline;
  }

  .view-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
  }

  .view-tab {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 8px 8px 0 0;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .view-tab:hover {
    color: #e0f5f0;
    background: rgba(255, 255, 255, 0.05);
  }

  .view-tab.active {
    color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
    border-bottom: 2px solid #0fb89f;
  }

  .badge {
    padding: 0.15rem 0.5rem;
    background: #ef4444;
    border-radius: 10px;
    font-size: 0.75rem;
    color: white;
  }

  .main-content {
    min-height: 400px;
  }

  /* Admin Panel */
  .admin-panel {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .admin-panel h2 {
    margin: 0 0 1.5rem;
    color: #e0f5f0;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .metric-card h3 {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: #7aa8a0;
    font-weight: 500;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0fb89f;
  }

  .metric-value.warning {
    color: #f59e0b;
  }

  .generation-log {
    margin-bottom: 2rem;
  }

  .generation-log h3 {
    margin: 0 0 1rem;
    color: #e0f5f0;
    font-size: 1rem;
  }

  .log-entries {
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 1rem;
    font-family: monospace;
    font-size: 0.8rem;
  }

  .log-entry {
    padding: 0.25rem 0;
    color: #7aa8a0;
  }

  .log-entry.warning {
    color: #f59e0b;
  }

  .log-entry.decision {
    color: #60a5fa;
  }

  .log-level {
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .satisfaction-section {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .satisfaction-section h3 {
    margin: 0 0 0.5rem;
    color: #e0f5f0;
  }

  .satisfaction-section p {
    margin: 0.25rem 0;
    color: #7aa8a0;
    font-size: 0.9rem;
  }

  .feedback-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    color: #60a5fa;
    cursor: pointer;
  }

  /* Satisfaction Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .satisfaction-modal {
    background: linear-gradient(135deg, #151f28 0%, #1a2530 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
  }

  .satisfaction-modal h3 {
    margin: 0 0 0.5rem;
    color: #e0f5f0;
  }

  .satisfaction-modal p {
    margin: 0 0 1.5rem;
    color: #7aa8a0;
  }

  .rating-stars {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .star {
    font-size: 2rem;
    background: none;
    border: none;
    color: #3a4a50;
    cursor: pointer;
    transition: all 0.2s;
  }

  .star:hover, .star.active {
    color: #fbbf24;
    transform: scale(1.1);
  }

  .satisfaction-modal textarea {
    width: 100%;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0f5f0;
    font-family: inherit;
    resize: none;
    margin-bottom: 1rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
  }

  .modal-actions .cancel {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
  }

  .modal-actions .submit {
    flex: 2;
    padding: 0.75rem;
    background: linear-gradient(135deg, #0fb89f, #0d9488);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .modal-actions .submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
