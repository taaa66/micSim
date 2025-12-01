<script lang="ts">
  import { fade } from 'svelte/transition';
  import { KINETIC } from '../../core/constants';

  export let text: string = '';
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let delay: number = 200;

  let visible = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-bg-light border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-bg-light border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-bg-light border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-bg-light border-y-transparent border-l-transparent'
  };

  function show() {
    timeoutId = setTimeout(() => {
      visible = true;
    }, delay);
  }

  function hide() {
    clearTimeout(timeoutId);
    visible = false;
  }
</script>

<div
  class="relative inline-block"
  on:mouseenter={show}
  on:mouseleave={hide}
  on:focus={show}
  on:blur={hide}
  role="tooltip"
>
  <slot />

  {#if visible && text}
    <div
      class="
        absolute z-50 {positions[position]}
        px-2 py-1 rounded
        bg-bg-light text-text-primary text-xs
        whitespace-nowrap shadow-lg
        pointer-events-none
      "
      transition:fade={{ duration: KINETIC.TRANSITION_FAST }}
    >
      {text}
      <div
        class="absolute w-0 h-0 border-4 {arrows[position]}"
      />
    </div>
  {/if}
</div>
