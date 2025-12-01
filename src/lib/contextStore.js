import { writable } from 'svelte/store';

// Global module context for DCS verification
// Holds the immutable integer moduleId (module.num)
export const currentModuleContext = writable(null);
