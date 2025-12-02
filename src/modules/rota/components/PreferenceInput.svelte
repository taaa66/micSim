<script lang="ts">
  /**
   * =============================================================================
   * PREFERENCE INPUT COMPONENT
   * =============================================================================
   * Modal interface for submitting monthly shift preferences
   * =============================================================================
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';
  import type { 
    ShiftPreference, 
    DatePreference, 
    DayPreference, 
    ShiftTypePreference,
    PreferenceLevel,
    ShiftType 
  } from '../types';
  import { PREFERENCE_COLORS, PREFERENCE_LABELS, DAYS_OF_WEEK, SHIFT_TYPES } from '../types';

  export let isOpen: boolean = false;
  export let month: number;
  export let year: number;
  export let userId: string;
  export let existingPreferences: ShiftPreference | null = null;

  const dispatch = createEventDispatcher();

  // Local state
  let datePreferences: DatePreference[] = existingPreferences?.datePreferences || [];
  let dayPreferences: DayPreference[] = existingPreferences?.dayPreferences || [];
  let shiftTypePreferences: ShiftTypePreference[] = existingPreferences?.shiftTypePreferences || [];
  let notes: string = existingPreferences?.notes || '';
  
  let selectedDate: Date | null = null;
  let activeTab: 'dates' | 'days' | 'types' = 'dates';

  // Calendar for date selection
  $: firstDay = new Date(year, month - 1, 1);
  $: lastDay = new Date(year, month, 0);
  $: daysInMonth = lastDay.getDate();
  $: startDayOfWeek = firstDay.getDay();

  $: calendarDays = generateCalendarDays();

  function generateCalendarDays(): (number | null)[] {
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function getDatePreference(day: number): PreferenceLevel | null {
    const date = new Date(year, month - 1, day);
    const pref = datePreferences.find(p => 
      p.date.getDate() === day && 
      p.date.getMonth() === month - 1 &&
      p.date.getFullYear() === year
    );
    return pref?.preference || null;
  }

  function setDatePreference(day: number, preference: PreferenceLevel) {
    const date = new Date(year, month - 1, day);
    const existingIndex = datePreferences.findIndex(p =>
      p.date.getDate() === day &&
      p.date.getMonth() === month - 1 &&
      p.date.getFullYear() === year
    );

    if (existingIndex >= 0) {
      datePreferences[existingIndex] = { date, preference };
    } else {
      datePreferences = [...datePreferences, { date, preference }];
    }
    selectedDate = null;
  }

  function removeDatePreference(day: number) {
    datePreferences = datePreferences.filter(p =>
      !(p.date.getDate() === day &&
        p.date.getMonth() === month - 1 &&
        p.date.getFullYear() === year)
    );
  }

  function getDayPreference(dayOfWeek: number): PreferenceLevel | null {
    return dayPreferences.find(p => p.dayOfWeek === dayOfWeek)?.preference || null;
  }

  function setDayPreference(dayOfWeek: number, preference: PreferenceLevel) {
    const existingIndex = dayPreferences.findIndex(p => p.dayOfWeek === dayOfWeek);
    if (existingIndex >= 0) {
      dayPreferences[existingIndex] = { dayOfWeek, preference };
    } else {
      dayPreferences = [...dayPreferences, { dayOfWeek, preference }];
    }
  }

  function getShiftTypePreference(shiftType: ShiftType): PreferenceLevel | null {
    return shiftTypePreferences.find(p => p.shiftType === shiftType)?.preference || null;
  }

  function setShiftTypePreference(shiftType: ShiftType, preference: PreferenceLevel) {
    const existingIndex = shiftTypePreferences.findIndex(p => p.shiftType === shiftType);
    if (existingIndex >= 0) {
      shiftTypePreferences[existingIndex] = { shiftType, preference };
    } else {
      shiftTypePreferences = [...shiftTypePreferences, { shiftType, preference }];
    }
  }

  function handleSubmit() {
    const preferences: ShiftPreference = {
      id: `pref-${userId}-${month}-${year}`,
      userId,
      month,
      year,
      datePreferences,
      dayPreferences,
      shiftTypePreferences,
      notes,
      submittedAt: new Date(),
      lastModified: new Date()
    };
    
    dispatch('submit', preferences);
    isOpen = false;
  }

  function handleClose() {
    dispatch('close');
    isOpen = false;
  }

  const preferenceOptions: PreferenceLevel[] = ['must_have', 'highly_preferred', 'indifferent', 'must_avoid'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={handleClose} transition:fade={{ duration: 200 }}>
    <div class="modal-content" on:click|stopPropagation transition:scale={{ duration: 300 }}>
      <button class="close-btn" on:click={handleClose}>×</button>
      
      <h2 class="modal-title">📅 Submit Preferences</h2>
      <p class="modal-subtitle">{monthNames[month - 1]} {year}</p>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          class:active={activeTab === 'dates'}
          on:click={() => activeTab = 'dates'}
        >
          Specific Dates
        </button>
        <button 
          class="tab" 
          class:active={activeTab === 'days'}
          on:click={() => activeTab = 'days'}
        >
          Days of Week
        </button>
        <button 
          class="tab" 
          class:active={activeTab === 'types'}
          on:click={() => activeTab = 'types'}
        >
          Shift Types
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'dates'}
          <div class="dates-tab" in:fly={{ x: -20, duration: 200 }}>
            <p class="instruction">Click a date to set your preference</p>
            
            <!-- Mini Calendar -->
            <div class="mini-calendar">
              <div class="mini-day-headers">
                {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as day}
                  <span>{day}</span>
                {/each}
              </div>
              <div class="mini-calendar-grid">
                {#each calendarDays as day}
                  {#if day}
                    {@const pref = getDatePreference(day)}
                    <button
                      class="mini-day"
                      class:selected={selectedDate?.getDate() === day}
                      style={pref ? `background-color: ${PREFERENCE_COLORS[pref]}30; border-color: ${PREFERENCE_COLORS[pref]}` : ''}
                      on:click={() => selectedDate = new Date(year, month - 1, day)}
                    >
                      {day}
                      {#if pref}
                        <span class="pref-dot" style="background-color: {PREFERENCE_COLORS[pref]}"></span>
                      {/if}
                    </button>
                  {:else}
                    <span class="mini-day empty"></span>
                  {/if}
                {/each}
              </div>
            </div>

            <!-- Preference Selector -->
            {#if selectedDate}
              <div class="preference-selector" in:scale={{ duration: 200 }}>
                <p class="selected-date">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div class="preference-buttons">
                  {#each preferenceOptions as pref}
                    <button
                      class="pref-btn"
                      style="border-color: {PREFERENCE_COLORS[pref]}; color: {PREFERENCE_COLORS[pref]}"
                      class:active={getDatePreference(selectedDate.getDate()) === pref}
                      on:click={() => setDatePreference(selectedDate.getDate(), pref)}
                    >
                      {PREFERENCE_LABELS[pref]}
                    </button>
                  {/each}
                </div>
                {#if getDatePreference(selectedDate.getDate())}
                  <button class="clear-btn" on:click={() => removeDatePreference(selectedDate.getDate())}>
                    Clear preference
                  </button>
                {/if}
              </div>
            {/if}
          </div>

        {:else if activeTab === 'days'}
          <div class="days-tab" in:fly={{ x: -20, duration: 200 }}>
            <p class="instruction">Set preferences for specific days of the week</p>
            
            <div class="days-list">
              {#each DAYS_OF_WEEK as day, index}
                <div class="day-row">
                  <span class="day-name">{day}</span>
                  <div class="day-prefs">
                    {#each preferenceOptions as pref}
                      <button
                        class="pref-chip"
                        class:active={getDayPreference(index) === pref}
                        style="--pref-color: {PREFERENCE_COLORS[pref]}"
                        on:click={() => setDayPreference(index, pref)}
                        title={PREFERENCE_LABELS[pref]}
                      >
                        {pref === 'must_have' ? '✓' : pref === 'highly_preferred' ? '↑' : pref === 'indifferent' ? '−' : '✗'}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>

        {:else if activeTab === 'types'}
          <div class="types-tab" in:fly={{ x: -20, duration: 200 }}>
            <p class="instruction">Set preferences for shift types</p>
            
            <div class="types-list">
              {#each Object.values(SHIFT_TYPES) as config}
                <div class="type-row">
                  <div class="type-info">
                    <span class="type-icon">{config.icon}</span>
                    <span class="type-name">{config.name}</span>
                  </div>
                  <div class="type-prefs">
                    {#each preferenceOptions as pref}
                      <button
                        class="pref-chip"
                        class:active={getShiftTypePreference(config.id) === pref}
                        style="--pref-color: {PREFERENCE_COLORS[pref]}"
                        on:click={() => setShiftTypePreference(config.id, pref)}
                        title={PREFERENCE_LABELS[pref]}
                      >
                        {pref === 'must_have' ? '✓' : pref === 'highly_preferred' ? '↑' : pref === 'indifferent' ? '−' : '✗'}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Notes -->
      <div class="notes-section">
        <label for="notes">Additional Notes</label>
        <textarea
          id="notes"
          bind:value={notes}
          placeholder="Any special circumstances or requests..."
          rows="3"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="cancel-btn" on:click={handleClose}>Cancel</button>
        <button class="submit-btn" on:click={handleSubmit}>Submit Preferences</button>
      </div>
    </div>
  </div>
{/if}

<style>
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
    padding: 1rem;
  }

  .modal-content {
    background: linear-gradient(135deg, #151f28 0%, #1a2530 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #7aa8a0;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .modal-title {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .modal-subtitle {
    margin: 0 0 1.5rem;
    color: #7aa8a0;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
  }

  .tab {
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .tab:hover {
    color: #e0f5f0;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .tab-content {
    min-height: 300px;
  }

  .instruction {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  /* Mini Calendar */
  .mini-calendar {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .mini-day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .mini-day-headers span {
    text-align: center;
    font-size: 0.75rem;
    color: #7aa8a0;
    font-weight: 600;
  }

  .mini-calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .mini-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    color: #e0f5f0;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .mini-day:hover:not(.empty) {
    background: rgba(255, 255, 255, 0.1);
  }

  .mini-day.selected {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.2);
  }

  .mini-day.empty {
    background: transparent;
    border-color: transparent;
    cursor: default;
  }

  .pref-dot {
    position: absolute;
    bottom: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .preference-selector {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 1rem;
  }

  .selected-date {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #e0f5f0;
    font-weight: 600;
    text-align: center;
  }

  .preference-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .pref-btn {
    padding: 0.75rem;
    background: transparent;
    border: 2px solid;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .pref-btn:hover {
    filter: brightness(1.2);
  }

  .pref-btn.active {
    background: currentColor;
    color: white !important;
  }

  .clear-btn {
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.8rem;
  }

  /* Days Tab */
  .days-list, .types-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .day-row, .type-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .day-name {
    font-size: 0.95rem;
    color: #e0f5f0;
    font-weight: 500;
  }

  .day-prefs, .type-prefs {
    display: flex;
    gap: 0.5rem;
  }

  .pref-chip {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 2px solid var(--pref-color);
    border-radius: 6px;
    color: var(--pref-color);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .pref-chip:hover {
    background: var(--pref-color);
    color: white;
  }

  .pref-chip.active {
    background: var(--pref-color);
    color: white;
  }

  .type-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .type-icon {
    font-size: 1.2rem;
  }

  .type-name {
    font-size: 0.9rem;
    color: #e0f5f0;
  }

  /* Notes */
  .notes-section {
    margin-top: 1.5rem;
  }

  .notes-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .notes-section textarea {
    width: 100%;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0f5f0;
    font-family: inherit;
    resize: vertical;
  }

  .notes-section textarea:focus {
    outline: none;
    border-color: #0fb89f;
  }

  /* Actions */
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cancel-btn {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .submit-btn {
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

  .submit-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
</style>
