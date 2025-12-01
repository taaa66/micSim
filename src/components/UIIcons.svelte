<script>
  export let icon;
  export let size = 20;
  export let color = "currentColor";
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  {#if icon === 'eye'}
    <!-- Eye/Vision -->
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  {:else if icon === 'dashboard'}
    <!-- Dashboard -->
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  {:else if icon === 'target'}
    <!-- Target/Precision -->
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  {:else if icon === 'activity'}
    <!-- Activity/Stats -->
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  {:else if icon === 'award'}
    <!-- Achievement -->
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  {:else if icon === 'user'}
    <!-- User Profile -->
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  {:else if icon === 'settings'}
    <!-- Settings -->
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/>
  {:else if icon === 'clock'}
    <!-- Time/Training -->
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  {:else if icon === 'zap'}
    <!-- Power/Energy -->
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  {:else if icon === 'trending-up'}
    <!-- Progress -->
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  {:else if icon === 'check-circle'}
    <!-- Complete -->
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  {:else if icon === 'alert-circle'}
    <!-- Alert -->
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  {:else if icon === 'info'}
    <!-- Information -->
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  {:else if icon === 'play'}
    <!-- Launch/Start -->
    <polygon points="5 3 19 12 5 21 5 3"/>
  {:else if icon === 'bar-chart'}
    <!-- Statistics -->
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  {:else if icon === 'layers'}
    <!-- Modules/Layers -->
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  {:else}
    <!-- Default: Circle -->
    <circle cx="12" cy="12" r="10"/>
  {/if}
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
