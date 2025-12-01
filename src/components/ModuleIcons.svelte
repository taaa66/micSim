<script>
  export let moduleId;
  export let size = 24;
  export let color = "currentColor";
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  {#if moduleId === 'capsulorhexis'}
    <!-- Professional lens capsule with tear pattern -->
    <circle cx="12" cy="12" r="10" opacity="0.3"/>
    <circle cx="12" cy="12" r="6"/>
    <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"/>
    <path d="M16 8 L18 6 M16 16 L18 18 M8 8 L6 6 M8 16 L6 18" opacity="0.5"/>
  {:else if moduleId === 'corneal-tunnel'}
    <!-- Professional corneal incision -->
    <ellipse cx="12" cy="12" rx="10" ry="8" opacity="0.2"/>
    <path d="M12 4 L12 8 M12 16 L12 20"/>
    <path d="M7 8 L10 10 L14 10 L17 8" stroke-width="2"/>
    <path d="M7 16 L10 14 L14 14 L17 16" stroke-width="2"/>
    <line x1="10" y1="10" x2="10" y2="14"/>
    <line x1="14" y1="10" x2="14" y2="14"/>
  {:else if moduleId === 'micro-tremor'}
    <!-- Hand stability with tremor waves -->
    <path d="M2 12 Q 5 9, 8 12 T 14 12 T 20 12" opacity="0.4"/>
    <path d="M2 14 Q 5 11, 8 14 T 14 14 T 20 14" opacity="0.6"/>
    <circle cx="12" cy="12" r="3" fill="none"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
    <path d="M12 2 L12 9 M12 15 L12 22" stroke-dasharray="1 2" opacity="0.5"/>
  {:else if moduleId === 'tissue-grasping'}
    <!-- Surgical forceps -->
    <path d="M7 3 L7 10 L9 12"/>
    <path d="M17 3 L17 10 L15 12"/>
    <ellipse cx="12" cy="13" rx="3" ry="2" opacity="0.3"/>
    <circle cx="12" cy="13" r="1.5"/>
    <path d="M7 3 L9 3 M17 3 L15 3" stroke-width="2"/>
  {:else if moduleId === 'needle-angle'}
    <!-- Injection needle with angle arc -->
    <path d="M5 19 L15 9"/>
    <circle cx="15" cy="9" r="2"/>
    <path d="M15 9 L17 7 L19 9" fill={color}/>
    <path d="M8 16 A 10 10 0 0 1 15 9" stroke-dasharray="2 3" opacity="0.6"/>
    <text x="10" y="14" font-size="6" fill={color}>45°</text>
  {:else if moduleId === 'corneal-arc'}
    <!-- Professional corneal suture arc -->
    <path d="M4 16 Q 12 6, 20 16" stroke-width="2"/>
    <circle cx="4" cy="16" r="2" fill={color} opacity="0.8"/>
    <circle cx="20" cy="16" r="2" fill={color} opacity="0.8"/>
    <circle cx="12" cy="9" r="2" fill={color} opacity="0.8"/>
    <path d="M6 14 L10 11 M14 11 L18 14" stroke-dasharray="2 2" opacity="0.5"/>
  {:else if moduleId === 'gang-io-damage'}
    <!-- Lens IOL with positioning -->
    <circle cx="12" cy="12" r="9" opacity="0.2"/>
    <circle cx="12" cy="12" r="6"/>
    <path d="M8 12 L12 8 L16 12 L12 16 Z" fill="none" stroke-width="2"/>
    <circle cx="8" cy="12" r="1" fill={color}/>
    <circle cx="16" cy="12" r="1" fill={color}/>
    <path d="M16 8 L19 5" opacity="0.6"/>
  {:else if moduleId === 'micro-precision'}
    <!-- Precision targeting system -->
    <circle cx="12" cy="12" r="10" opacity="0.2"/>
    <circle cx="12" cy="12" r="7" opacity="0.4"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
    <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12"/>
    <path d="M17 7 L19 5 M17 17 L19 19 M7 7 L5 5 M7 17 L5 19" opacity="0.5"/>
  {:else if moduleId === 'suture-place'}
    <!-- Suture placement technique -->
    <path d="M4 8 L8 12 L4 16" stroke-width="2"/>
    <path d="M20 8 L16 12 L20 16" stroke-width="2"/>
    <path d="M8 12 Q 12 10, 16 12" stroke-width="2"/>
    <circle cx="8" cy="12" r="1.5" fill={color}/>
    <circle cx="16" cy="12" r="1.5" fill={color}/>
    <circle cx="12" cy="11" r="1" fill={color}/>
  {:else if moduleId === 'suture-tens'}
    <!-- Tension measurement -->
    <path d="M4 12 L20 12" stroke-width="2"/>
    <path d="M8 8 L8 16" stroke-width="2"/>
    <path d="M16 8 L16 16" stroke-width="2"/>
    <path d="M10 10 L14 10 M10 14 L14 14"/>
    <circle cx="12" cy="12" r="2" fill="none"/>
    <path d="M6 6 L6 18 M18 6 L18 18" stroke-dasharray="2 2" opacity="0.4"/>
  {:else if moduleId === 'hydrodissect'}
    <!-- Hydrodissection fluid flow -->
    <circle cx="12" cy="12" r="9" opacity="0.2"/>
    <circle cx="12" cy="12" r="6" stroke-dasharray="3 2"/>
    <path d="M12 4 L12 12 L16 8" stroke-width="2"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke-dasharray="2 2"/>
    <path d="M8 12 Q 10 14, 12 12 Q 14 10, 16 12" opacity="0.5"/>
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
