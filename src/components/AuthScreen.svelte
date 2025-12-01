<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { login, register } from '../lib/authStore.js';

  const dispatch = createEventDispatcher();

  let mode = 'login'; // 'login' or 'register'
  let isLoading = false;
  let error = '';

  // Form fields
  let idNumber = '';
  let doctorNumber = '';
  let fullName = '';
  let specialty = '';

  // Validation
  $: idValid = idNumber.replace(/\D/g, '').length >= 5;
  $: doctorValid = doctorNumber.length >= 4;
  $: nameValid = fullName.trim().length >= 2;
  $: canSubmit = mode === 'login' 
    ? (idValid && doctorValid)
    : (idValid && doctorValid && nameValid);

  async function handleSubmit() {
    if (!canSubmit || isLoading) return;

    isLoading = true;
    error = '';

    // Simulate network delay for UX
    await new Promise(r => setTimeout(r, 500));

    let result;
    if (mode === 'login') {
      result = login(idNumber, doctorNumber);
    } else {
      result = register(idNumber, doctorNumber, fullName, specialty);
    }

    isLoading = false;

    if (result.success) {
      dispatch('authenticated', result.user);
    } else {
      error = result.error;
    }
  }

  function toggleMode() {
    mode = mode === 'login' ? 'register' : 'login';
    error = '';
  }

  function formatIdNumber(e) {
    // Keep only digits
    idNumber = e.target.value.replace(/\D/g, '').slice(0, 9);
  }
</script>

<div class="auth-overlay" transition:fade={{ duration: 300 }}>
  <div class="auth-container" transition:fly={{ y: 30, duration: 400 }}>
    <!-- Logo & Header -->
    <div class="auth-header">
      <div class="logo">
        <div class="eye-icon">
          <div class="iris"></div>
          <div class="pupil"></div>
        </div>
      </div>
      <h1>OPHTHALMIC SIMULATOR</h1>
      <p>מערכת אימון מתקדמת למיקרוכירורגיה</p>
    </div>

    <!-- Tabs -->
    <div class="auth-tabs">
      <button 
        class="tab" 
        class:active={mode === 'login'}
        on:click={() => { mode = 'login'; error = ''; }}
      >
        כניסה
      </button>
      <button 
        class="tab" 
        class:active={mode === 'register'}
        on:click={() => { mode = 'register'; error = ''; }}
      >
        הרשמה
      </button>
    </div>

    <!-- Form -->
    <form class="auth-form" on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="error-message" transition:scale={{ duration: 200 }}>
          ⚠️ {error}
        </div>
      {/if}

      <div class="form-group">
        <label for="idNumber">תעודת זהות</label>
        <input
          id="idNumber"
          type="text"
          inputmode="numeric"
          placeholder="הזן תעודת זהות"
          bind:value={idNumber}
          on:input={formatIdNumber}
          class:valid={idValid}
          autocomplete="username"
        />
        <span class="hint">משמש כשם משתמש</span>
      </div>

      <div class="form-group">
        <label for="doctorNumber">מספר רופא</label>
        <input
          id="doctorNumber"
          type="password"
          placeholder="הזן מספר רופא"
          bind:value={doctorNumber}
          class:valid={doctorValid}
          autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        <span class="hint">משמש כסיסמה</span>
      </div>

      {#if mode === 'register'}
        <div class="form-group" transition:fly={{ y: -10, duration: 200 }}>
          <label for="fullName">שם מלא</label>
          <input
            id="fullName"
            type="text"
            placeholder="ד״ר ישראל ישראלי"
            bind:value={fullName}
            class:valid={nameValid}
            autocomplete="name"
          />
        </div>

        <div class="form-group" transition:fly={{ y: -10, duration: 200 }}>
          <label for="specialty">התמחות (אופציונלי)</label>
          <select id="specialty" bind:value={specialty}>
            <option value="">רופא עיניים</option>
            <option value="קטרקט">התמחות קטרקט</option>
            <option value="רשתית">התמחות רשתית</option>
            <option value="גלאוקומה">התמחות גלאוקומה</option>
            <option value="קרנית">התמחות קרנית</option>
            <option value="סטרביזמוס">התמחות סטרביזמוס</option>
            <option value="מתמחה">מתמחה</option>
          </select>
        </div>
      {/if}

      <button 
        type="submit" 
        class="submit-btn"
        disabled={!canSubmit || isLoading}
      >
        {#if isLoading}
          <span class="spinner"></span>
          מתחבר...
        {:else}
          {mode === 'login' ? '🔐 כניסה למערכת' : '✨ הרשמה'}
        {/if}
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      {#if mode === 'login'}
        <p>אין לך חשבון? <button class="link-btn" on:click={toggleMode}>הירשם עכשיו</button></p>
      {:else}
        <p>יש לך חשבון? <button class="link-btn" on:click={toggleMode}>התחבר</button></p>
      {/if}
    </div>

    <div class="version">V14.0 | Secure Medical Platform</div>
  </div>
</div>

<style>
  .auth-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #040d10 0%, #0a1a1f 50%, #051014 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    direction: rtl;
  }

  .auth-container {
    width: 100%;
    max-width: 420px;
    background: rgba(10, 26, 31, 0.95);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 20px;
    padding: 40px 32px;
    box-shadow: 
      0 0 60px rgba(15, 184, 159, 0.1),
      0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .eye-icon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: radial-gradient(circle, #0d2b35 0%, #051014 100%);
    border: 2px solid rgba(52, 211, 153, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(52, 211, 153, 0.2);
    animation: eyePulse 3s ease-in-out infinite;
  }

  @keyframes eyePulse {
    0%, 100% { box-shadow: 0 0 30px rgba(52, 211, 153, 0.2); }
    50% { box-shadow: 0 0 50px rgba(52, 211, 153, 0.4); }
  }

  .iris {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: radial-gradient(circle, #1a5a6a 0%, #0f3a45 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pupil {
    width: 15px;
    height: 15px;
    background: #000;
    border-radius: 50%;
  }

  .auth-header h1 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #fff;
    margin: 0 0 8px;
  }

  .auth-header p {
    font-size: 13px;
    color: #7aa8a0;
    margin: 0;
  }

  .auth-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .tab {
    flex: 1;
    padding: 12px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #7aa8a0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab.active {
    background: rgba(15, 184, 159, 0.15);
    border-color: rgba(15, 184, 159, 0.5);
    color: #34d399;
  }

  .tab:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 600;
    color: #e0f5f0;
  }

  .form-group input,
  .form-group select {
    padding: 14px 16px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    transition: all 0.2s ease;
    direction: ltr;
    text-align: right;
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: rgba(15, 184, 159, 0.5);
    box-shadow: 0 0 0 3px rgba(15, 184, 159, 0.1);
  }

  .form-group input.valid {
    border-color: rgba(52, 211, 153, 0.5);
  }

  .form-group select {
    direction: rtl;
    cursor: pointer;
  }

  .hint {
    font-size: 11px;
    color: rgba(122, 168, 160, 0.6);
  }

  .error-message {
    padding: 12px 16px;
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: 10px;
    color: #fca5a5;
    font-size: 13px;
    text-align: center;
  }

  .submit-btn {
    padding: 16px;
    background: linear-gradient(135deg, #0fb89f 0%, #34d399 100%);
    border: none;
    border-radius: 12px;
    color: #040d10;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 54px;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(15, 184, 159, 0.3);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(4, 13, 16, 0.3);
    border-top-color: #040d10;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-footer {
    margin-top: 24px;
    text-align: center;
  }

  .auth-footer p {
    font-size: 13px;
    color: #7aa8a0;
    margin: 0;
  }

  .link-btn {
    background: none;
    border: none;
    color: #34d399;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }

  .link-btn:hover {
    color: #0fb89f;
  }

  .version {
    text-align: center;
    margin-top: 24px;
    font-size: 10px;
    color: rgba(122, 168, 160, 0.4);
    letter-spacing: 1px;
  }
</style>
