<!--
  =============================================================================
  SETTINGS MODAL
  =============================================================================
  User preferences and accessibility settings
  =============================================================================
-->

<script lang="ts">
  import { Modal, ModernButton } from './ui';
  import { a11yPreferences, saveA11yPreferences } from '../lib/accessibility';
  import { toasts } from '../stores/toast';
  import { downloadUserData, downloadUserDataCSV } from '../lib/dataExport';
  
  export let open = false;
  
  // Local state bound to preferences
  let reduceMotion = false;
  let highContrast = false;
  let fontSize: 'normal' | 'large' | 'x-large' = 'normal';
  
  // Sync with store
  $: if (open) {
    reduceMotion = $a11yPreferences.reduceMotion;
    highContrast = $a11yPreferences.highContrast;
    fontSize = $a11yPreferences.fontSize;
  }
  
  function handleSave() {
    saveA11yPreferences({
      reduceMotion,
      highContrast,
      fontSize
    });
    toasts.success('ההגדרות נשמרו');
    open = false;
  }
  
  async function handleExportJSON() {
    try {
      await downloadUserData();
      toasts.success('הנתונים יורדו בפורמט JSON');
    } catch {
      toasts.error('שגיאה בייצוא הנתונים');
    }
  }
  
  async function handleExportCSV() {
    try {
      await downloadUserDataCSV();
      toasts.success('הנתונים יורדו בפורמט CSV');
    } catch {
      toasts.error('שגיאה בייצוא הנתונים');
    }
  }
</script>

<Modal bind:open title="הגדרות" size="md" showFooter>
  <div class="settings-content">
    <!-- Accessibility Section -->
    <section class="settings-section">
      <h3>נגישות</h3>
      
      <label class="setting-item">
        <span class="setting-label">הפחת אנימציות</span>
        <input type="checkbox" bind:checked={reduceMotion} />
        <span class="toggle"></span>
      </label>
      
      <label class="setting-item">
        <span class="setting-label">ניגודיות גבוהה</span>
        <input type="checkbox" bind:checked={highContrast} />
        <span class="toggle"></span>
      </label>
      
      <div class="setting-item">
        <span class="setting-label">גודל גופן</span>
        <select bind:value={fontSize}>
          <option value="normal">רגיל</option>
          <option value="large">גדול</option>
          <option value="x-large">גדול מאוד</option>
        </select>
      </div>
    </section>
    
    <!-- Data Export Section -->
    <section class="settings-section">
      <h3>ייצוא נתונים</h3>
      <p class="section-description">
        הורד את כל הנתונים שלך בהתאם ל-GDPR
      </p>
      
      <div class="export-buttons">
        <ModernButton variant="secondary" size="sm" fullWidth on:click={handleExportJSON} icon="📄">
          ייצוא JSON
        </ModernButton>
        <ModernButton variant="secondary" size="sm" fullWidth on:click={handleExportCSV} icon="📊">
          ייצוא CSV
        </ModernButton>
      </div>
    </section>
    
    <!-- Keyboard Shortcuts Section -->
    <section class="settings-section">
      <h3>קיצורי מקלדת</h3>
      <div class="shortcuts-list">
        <div class="shortcut">
          <kbd>Esc</kbd>
          <span>חזור אחורה</span>
        </div>
        <div class="shortcut">
          <kbd>Ctrl+H</kbd>
          <span>חזור לדשבורד</span>
        </div>
        <div class="shortcut">
          <kbd>F11</kbd>
          <span>מסך מלא</span>
        </div>
      </div>
    </section>
  </div>
  
  <svelte:fragment slot="footer">
    <ModernButton variant="ghost" on:click={() => open = false}>ביטול</ModernButton>
    <ModernButton variant="primary" on:click={handleSave}>שמור שינויים</ModernButton>
  </svelte:fragment>
</Modal>

<style>
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .settings-section {
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .settings-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .settings-section h3 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    color: #3b82f6;
    font-weight: 600;
  }
  
  .section-description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    margin: 0 0 12px 0;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    cursor: pointer;
  }
  
  .setting-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }
  
  .setting-item input[type="checkbox"] {
    display: none;
  }
  
  .toggle {
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    position: relative;
    transition: background 0.2s;
  }
  
  .toggle::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  
  .setting-item input:checked + .toggle {
    background: #3b82f6;
  }
  
  .setting-item input:checked + .toggle::after {
    transform: translateX(20px);
  }
  
  select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 12px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  select option {
    background: #1a1a2e;
    color: white;
  }
  
  .export-buttons {
    display: flex;
    gap: 12px;
  }
  
  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .shortcut {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }
  
  kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: monospace;
    font-size: 0.8rem;
    color: #3b82f6;
    min-width: 60px;
    text-align: center;
  }
  
  .shortcut span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
  }
</style>
