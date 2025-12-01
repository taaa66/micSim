<script lang="ts">
  /**
   * ReportsView - Report generation and viewing
   */
  import { fade } from 'svelte/transition';
  import { KINETIC, COLORS } from '../../core/constants';
  import { Tabs, Button } from '../../components/common';

  let activeTab = 'performance';

  const reportTabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'progress', label: 'Progress' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'export', label: 'Export' }
  ];

  const mockReports = [
    { id: '1', title: 'Weekly Performance Summary', date: '2024-01-15', type: 'performance' },
    { id: '2', title: 'Module Progress Report', date: '2024-01-14', type: 'progress' },
    { id: '3', title: 'Session Analysis', date: '2024-01-13', type: 'sessions' }
  ];
</script>

<div
  class="reports-view relative w-full h-full overflow-hidden p-6"
  style="transform: translateZ(0);"
  transition:fade={{ duration: KINETIC.TRANSITION_NORMAL }}
>
  <!-- Header -->
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-text-primary">REPORTS</h1>
    <p class="text-sm text-text-muted">Performance analytics and session reports</p>
  </header>

  <!-- Tabs -->
  <Tabs tabs={reportTabs} bind:activeTab variant="underline" />

  <!-- Content -->
  <div class="mt-6 space-y-4">
    {#if activeTab === 'export'}
      <div class="p-8 bg-bg-medium rounded-lg border border-primary/20 text-center">
        <h3 class="text-lg font-bold text-text-primary mb-4">Export Reports</h3>
        <p class="text-text-muted mb-6">Generate comprehensive reports for your records.</p>
        <div class="flex justify-center gap-4">
          <Button variant="primary">Export PDF</Button>
          <Button variant="secondary">Export CSV</Button>
        </div>
      </div>
    {:else}
      {#each mockReports.filter(r => activeTab === 'performance' || r.type === activeTab) as report (report.id)}
        <div
          class="p-4 bg-bg-medium rounded-lg border border-primary/20 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div>
            <h3 class="font-medium text-text-primary">{report.title}</h3>
            <p class="text-xs text-text-muted">{report.date}</p>
          </div>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .reports-view {
    will-change: contents;
  }
</style>
