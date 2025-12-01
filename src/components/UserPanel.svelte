<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { currentUser, logout, displayName } from '../lib/authStore.js';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  
  function handleLogout() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      logout();
    }
  }
  
  function handleOpenAnalytics() {
    isOpen = false;
    dispatch('openAnalytics');
  }

  function togglePanel() {
    isOpen = !isOpen;
  }

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return 'לא ידוע';
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL');
  }
</script>

<!-- User Button (always visible) -->
<button class="user-btn" on:click={togglePanel} class:open={isOpen}>
  <div class="avatar">
    {$currentUser?.fullName?.charAt(0) || '?'}
  </div>
  <span class="user-name">{$displayName}</span>
  <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M6 9l6 6 6-6"/>
  </svg>
</button>

<!-- User Panel Dropdown -->
{#if isOpen}
  <div class="panel-overlay" on:click={togglePanel} on:keydown={(e) => e.key === 'Escape' && togglePanel()} role="button" tabindex="-1" transition:fade={{ duration: 150 }}></div>
  
  <div class="user-panel" transition:fly={{ y: -10, duration: 200 }}>
    <!-- User Info -->
    <div class="user-info">
      <div class="avatar-large">
        {$currentUser?.fullName?.charAt(0) || '?'}
      </div>
      <div class="user-details">
        <h3>{$currentUser?.fullName || 'משתמש'}</h3>
        <span class="specialty">{$currentUser?.specialty || 'רופא עיניים'}</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat">
        <span class="stat-value">{$currentUser?.stats?.totalSessions || 0}</span>
        <span class="stat-label">אימונים</span>
      </div>
      <div class="stat">
        <span class="stat-value">{$currentUser?.stats?.highestScore || 0}</span>
        <span class="stat-label">שיא ניקוד</span>
      </div>
      <div class="stat">
        <span class="stat-value">{$currentUser?.stats?.averageScore || 0}</span>
        <span class="stat-label">ממוצע</span>
      </div>
      <div class="stat">
        <span class="stat-value">{$currentUser?.stats?.modulesCompleted?.length || 0}</span>
        <span class="stat-label">מודולים</span>
      </div>
    </div>

    <!-- Info -->
    <div class="info-section">
      <div class="info-row">
        <span class="info-label">ת.ז:</span>
        <span class="info-value">{$currentUser?.id || '---'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">הצטרף:</span>
        <span class="info-value">{formatDate($currentUser?.createdAt)}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="analytics-btn" on:click={handleOpenAnalytics}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        סטטיסטיקות
      </button>
      <button class="logout-btn" on:click={handleLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        התנתק
      </button>
    </div>
  </div>
{/if}

<style>
  .user-btn {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px 6px 6px;
    background: rgba(10, 26, 31, 0.95);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 30px;
    color: #e0f5f0;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }

  .user-btn:hover, .user-btn.open {
    border-color: rgba(15, 184, 159, 0.6);
    background: rgba(15, 184, 159, 0.1);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0fb89f 0%, #34d399 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: #040d10;
  }

  .user-name {
    font-size: 13px;
    font-weight: 600;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chevron {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  .user-btn.open .chevron {
    transform: rotate(180deg);
  }

  .panel-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    cursor: pointer;
  }

  .user-panel {
    position: fixed;
    top: 60px;
    left: 12px;
    z-index: 1001;
    width: 280px;
    background: rgba(10, 26, 31, 0.98);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    direction: rtl;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 16px;
  }

  .avatar-large {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0fb89f 0%, #34d399 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 22px;
    color: #040d10;
  }

  .user-details h3 {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 4px;
  }

  .specialty {
    font-size: 12px;
    color: #7aa8a0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat {
    text-align: center;
    padding: 10px 4px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .stat-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #34d399;
  }

  .stat-label {
    display: block;
    font-size: 9px;
    color: #7aa8a0;
    margin-top: 2px;
  }

  .info-section {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    margin-bottom: 16px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    padding: 4px 0;
  }

  .info-label {
    color: #7aa8a0;
  }

  .info-value {
    color: #e0f5f0;
    font-family: monospace;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .analytics-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.2), rgba(52, 211, 153, 0.1));
    border: 1px solid rgba(52, 211, 153, 0.4);
    border-radius: 10px;
    color: #34d399;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .analytics-btn:hover {
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.3), rgba(52, 211, 153, 0.2));
    border-color: rgba(52, 211, 153, 0.6);
    transform: translateY(-1px);
  }

  .analytics-btn svg {
    width: 18px;
    height: 18px;
  }

  .logout-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    background: rgba(248, 113, 113, 0.2);
    border-color: rgba(248, 113, 113, 0.5);
  }

  .logout-btn svg {
    width: 18px;
    height: 18px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .user-name {
      display: none;
    }
    
    .user-btn {
      padding: 6px;
    }

    .user-panel {
      left: 8px;
      right: 8px;
      width: auto;
    }
  }
</style>
