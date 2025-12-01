<script lang="ts">
  import { COLORS } from '../../core/constants';

  export let mastery: number = 0;

  function getMasteryLabel(value: number): string {
    if (value >= 95) return 'APEX ELITE';
    if (value >= 85) return 'EXPERT';
    if (value >= 70) return 'PROFICIENT';
    if (value >= 50) return 'DEVELOPING';
    return 'NOVICE';
  }

  $: masteryLabel = getMasteryLabel(mastery);
</script>

<header class="absolute top-0 left-0 right-0 z-20 p-4">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-text-primary">
        TRAINING MATRIX
      </h1>
      <p class="text-xs text-text-muted">
        11 Modules • {mastery}% Complete
      </p>
    </div>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <span class="text-xs text-text-muted">Status</span>
        <p class="text-sm font-bold text-primary">{masteryLabel}</p>
      </div>
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center"
        style="background: {COLORS.PRIMARY}20;"
      >
        <span class="text-primary font-bold">{mastery}%</span>
      </div>
    </div>
  </div>
</header>
