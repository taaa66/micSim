<script lang="ts">
  /**
   * =============================================================================
   * ROTA CALENDAR COMPONENT
   * =============================================================================
   * Monthly calendar view showing shift assignments
   * =============================================================================
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import type { ShiftAssignment, ShiftType, RotaUser } from '../types';
  import { SHIFT_TYPES, DAYS_OF_WEEK } from '../types';

  export let assignments: ShiftAssignment[] = [];
  export let users: RotaUser[] = [];
  export let month: number;
  export let year: number;
  export let currentUserId: string = '';
  export let highlightMyShifts: boolean = true;

  const dispatch = createEventDispatcher();

  // Calendar calculations
  $: firstDay = new Date(year, month - 1, 1);
  $: lastDay = new Date(year, month, 0);
  $: daysInMonth = lastDay.getDate();
  $: startDayOfWeek = firstDay.getDay();
  
  $: calendarDays = generateCalendarDays();

  function generateCalendarDays(): (number | null)[] {
    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    // Fill remaining cells to complete the grid
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    
    return days;
  }

  function getAssignmentsForDay(day: number): ShiftAssignment[] {
    if (!day) return [];
    const date = new Date(year, month - 1, day);
    return assignments.filter(a => {
      const aDate = new Date(a.date);
      return aDate.getDate() === day && 
             aDate.getMonth() === month - 1 && 
             aDate.getFullYear() === year;
    });
  }

  function getShiftConfig(shiftType: ShiftType) {
    return SHIFT_TYPES[shiftType];
  }

  function getUserName(userId: string): string {
    const user = users.find(u => u.id === userId);
    return user?.name.split(' ').pop() || 'Unknown';
  }

  function isMyShift(assignment: ShiftAssignment): boolean {
    return assignment.primaryUserId === currentUserId || assignment.backupUserId === currentUserId;
  }

  function isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           month - 1 === today.getMonth() && 
           year === today.getFullYear();
  }

  function isWeekend(dayIndex: number): boolean {
    return dayIndex % 7 === 0 || dayIndex % 7 === 6;
  }

  function handleDayClick(day: number) {
    if (!day) return;
    dispatch('dayClick', { day, date: new Date(year, month - 1, day) });
  }

  function handleShiftClick(assignment: ShiftAssignment, event: MouseEvent) {
    event.stopPropagation();
    dispatch('shiftClick', { assignment });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
</script>

<div class="rota-calendar" in:fly={{ y: 20, duration: 400 }}>
  <!-- Calendar Header -->
  <div class="calendar-header">
    <button class="nav-btn" on:click={() => dispatch('prevMonth')}>
      ←
    </button>
    <h2 class="month-title">{monthNames[month - 1]} {year}</h2>
    <button class="nav-btn" on:click={() => dispatch('nextMonth')}>
      →
    </button>
  </div>

  <!-- Day Headers -->
  <div class="day-headers">
    {#each DAYS_OF_WEEK as day, i}
      <div class="day-header" class:weekend={i === 0 || i === 6}>
        {day.slice(0, 3)}
      </div>
    {/each}
  </div>

  <!-- Calendar Grid -->
  <div class="calendar-grid">
    {#each calendarDays as day, index}
      <button
        class="calendar-day"
        class:empty={!day}
        class:today={day && isToday(day)}
        class:weekend={isWeekend(index)}
        class:has-shifts={day && getAssignmentsForDay(day).length > 0}
        class:has-my-shift={day && highlightMyShifts && getAssignmentsForDay(day).some(isMyShift)}
        on:click={() => day && handleDayClick(day)}
        disabled={!day}
      >
        {#if day}
          <span class="day-number">{day}</span>
          
          <div class="shifts-container">
            {#each getAssignmentsForDay(day).slice(0, 3) as assignment}
              {@const config = getShiftConfig(assignment.shiftType)}
              <button
                class="shift-pill"
                class:my-shift={isMyShift(assignment)}
                style="background-color: {config.color}20; border-color: {config.color}"
                on:click={(e) => handleShiftClick(assignment, e)}
                title="{config.name} - {getUserName(assignment.primaryUserId)}"
              >
                <span class="shift-icon">{config.icon}</span>
                <span class="shift-user">{getUserName(assignment.primaryUserId)}</span>
              </button>
            {/each}
            
            {#if getAssignmentsForDay(day).length > 3}
              <span class="more-shifts">+{getAssignmentsForDay(day).length - 3} more</span>
            {/if}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Legend -->
  <div class="calendar-legend">
    <span class="legend-title">Shift Types:</span>
    {#each Object.values(SHIFT_TYPES) as config}
      <div class="legend-item">
        <span class="legend-color" style="background-color: {config.color}"></span>
        <span class="legend-label">{config.shortName}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .rota-calendar {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0f5f0;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    background: rgba(15, 184, 159, 0.2);
    border-color: rgba(15, 184, 159, 0.3);
  }

  .month-title {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .day-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .day-header {
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #7aa8a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .day-header.weekend {
    color: #f59e0b;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .calendar-day {
    min-height: 100px;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .calendar-day:hover:not(.empty) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .calendar-day.empty {
    background: transparent;
    border-color: transparent;
    cursor: default;
  }

  .calendar-day.today {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .calendar-day.weekend {
    background: rgba(245, 158, 11, 0.05);
  }

  .calendar-day.has-my-shift {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
  }

  .day-number {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e0f5f0;
    margin-bottom: 0.5rem;
  }

  .calendar-day.today .day-number {
    color: #0fb89f;
  }

  .shifts-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    overflow: hidden;
  }

  .shift-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    text-align: left;
    width: 100%;
  }

  .shift-pill:hover {
    transform: scale(1.02);
    filter: brightness(1.2);
  }

  .shift-pill.my-shift {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  .shift-icon {
    font-size: 0.8rem;
  }

  .shift-user {
    color: #e0f5f0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .more-shifts {
    font-size: 0.65rem;
    color: #7aa8a0;
    text-align: center;
    padding: 2px;
  }

  .calendar-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    align-items: center;
  }

  .legend-title {
    font-size: 0.8rem;
    color: #7aa8a0;
    font-weight: 600;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .legend-label {
    font-size: 0.75rem;
    color: #e0f5f0;
  }

  @media (max-width: 768px) {
    .calendar-day {
      min-height: 70px;
      padding: 0.25rem;
    }

    .shift-pill {
      padding: 1px 4px;
    }

    .shift-user {
      display: none;
    }

    .day-header {
      font-size: 0.7rem;
    }
  }
</style>
