<script>
  export let moduleId;
  export let size = 24;
  export let color = "currentColor";
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  {#if moduleId === 'capsulorhexis'}
    <!-- Circle with crosshair -->
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="3" x2="12" y2="7"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="7" y2="12"/>
    <line x1="17" y1="12" x2="21" y2="12"/>
  {:else if moduleId === 'corneal-tunnel'}
    <!-- Tunnel/incision -->
    <path d="M3 12 L8 8 L16 8 L21 12 L16 16 L8 16 Z"/>
    <line x1="8" y1="8" x2="8" y2="16"/>
    <line x1="16" y1="8" x2="16" y2="16"/>
  {:else if moduleId === 'micro-tremor'}
    <!-- Stability waves -->
    <path d="M2 12 Q 6 8, 10 12 T 18 12 T 22 12"/>
    <line x1="12" y1="4" x2="12" y2="20" stroke-dasharray="2 2"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  {:else if moduleId === 'tissue-grasping'}
    <!-- Forceps/grasp -->
    <path d="M6 4 L6 12 L10 16"/>
    <path d="M18 4 L18 12 L14 16"/>
    <circle cx="12" cy="16" r="2"/>
  {:else if moduleId === 'needle-angle'}
    <!-- Needle with angle -->
    <line x1="4" y1="20" x2="16" y2="8"/>
    <circle cx="16" cy="8" r="2"/>
    <path d="M8 16 A 8 8 0 0 1 16 8" stroke-dasharray="2 2"/>
  {:else if moduleId === 'corneal-arc'}
    <!-- Arc suture -->
    <path d="M4 16 Q 12 4, 20 16"/>
    <circle cx="4" cy="16" r="1.5" fill={color}/>
    <circle cx="20" cy="16" r="1.5" fill={color}/>
    <circle cx="12" cy="8" r="1.5" fill={color}/>
  {:else if moduleId === 'gang-io-damage'}
    <!-- Lens with damage indicator -->
    <circle cx="12" cy="12" r="8"/>
    <path d="M8 12 L12 8 L16 12 L12 16 Z" fill="none"/>
    <line x1="16" y1="8" x2="20" y2="4"/>
  {:else if moduleId === 'micro-precision'}
    <!-- Precision target -->
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
    <line x1="12" y1="2" x2="12" y2="4"/>
    <line x1="12" y1="20" x2="12" y2="22"/>
  {:else if moduleId === 'suture-place'}
    <!-- Suture pattern -->
    <path d="M4 8 L8 12 L4 16"/>
    <path d="M20 8 L16 12 L20 16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <circle cx="12" cy="12" r="2"/>
  {:else if moduleId === 'suture-tens'}
    <!-- Tension indicator -->
    <line x1="4" y1="12" x2="20" y2="12"/>
    <path d="M8 8 L8 16"/>
    <path d="M16 8 L16 16"/>
    <path d="M10 10 L14 10"/>
    <path d="M10 14 L14 14"/>
  {:else if moduleId === 'hydrodissect'}
    <!-- Fluid injection -->
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 4 L12 12 L16 8"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke-dasharray="2 2"/>
  {:else}
    <!-- Default: Eye icon -->
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  {/if}
</svg>

<style>
  svg {
    display: inline-block;
    vertical-align: middle;
  }
</style>
