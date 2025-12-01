<script>
  // Interactive Backend Architecture Diagram
  let hoveredService = null;
  
  const services = [
    { id: 'tremor', name: 'Tremor Analysis', port: 8001, lang: 'Python/C++', color: '#3b82f6' },
    { id: 'force', name: 'Force Quantification', port: 8002, lang: 'C++/Python', color: '#8b5cf6' },
    { id: 'score', name: 'Score Engine', port: 8003, lang: 'Rust/gRPC', color: '#f59e0b' },
    { id: 'leaderboard', name: 'Leaderboard', port: 8004, lang: 'Go', color: '#10b981' },
    { id: 'session', name: 'Session Mgmt', port: 8005, lang: 'Node.js', color: '#ef4444' },
    { id: 'biofeedback', name: 'Biofeedback', port: 8006, lang: 'Python', color: '#ec4899' },
    { id: 'analytics', name: 'Analytics', port: 8007, lang: 'Python', color: '#06b6d4' }
  ];
</script>

<div class="architecture-container">
  <h2 class="diagram-title">MICROSERVICES ARCHITECTURE</h2>
  <p class="diagram-subtitle">Ophthalmic Simulator Backend Infrastructure</p>
  
  <svg viewBox="0 0 1000 700" class="architecture-svg">
    <defs>
      <!-- Gradients -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a1520"/>
        <stop offset="100%" stop-color="#0d1f28"/>
      </linearGradient>
      
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0fb89f"/>
        <stop offset="100%" stop-color="#34d399"/>
      </linearGradient>
      
      <!-- Glow filter -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- Arrow marker -->
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#0fb89f" opacity="0.6"/>
      </marker>
    </defs>
    
    <!-- Background -->
    <rect width="1000" height="700" fill="url(#bgGrad)"/>
    
    <!-- Grid lines -->
    {#each Array(20) as _, i}
      <line x1={i * 50} y1="0" x2={i * 50} y2="700" stroke="rgba(15,184,159,0.05)" stroke-width="1"/>
      <line x1="0" y1={i * 35} x2="1000" y2={i * 35} stroke="rgba(15,184,159,0.05)" stroke-width="1"/>
    {/each}
    
    <!-- FRONTEND LAYER -->
    <g transform="translate(0, 30)">
      <rect x="50" y="0" width="900" height="80" rx="8" fill="rgba(15,184,159,0.08)" stroke="rgba(15,184,159,0.3)" stroke-width="1"/>
      <text x="500" y="-10" text-anchor="middle" fill="#0fb89f" font-size="12" font-weight="bold" letter-spacing="2">FRONTEND LAYER</text>
      
      <!-- Frontend boxes -->
      <rect x="80" y="20" width="150" height="40" rx="4" fill="rgba(15,184,159,0.15)" stroke="#0fb89f" stroke-width="1"/>
      <text x="155" y="45" text-anchor="middle" fill="#e0f5f0" font-size="11">Radial Dashboard</text>
      
      <rect x="260" y="20" width="150" height="40" rx="4" fill="rgba(15,184,159,0.15)" stroke="#0fb89f" stroke-width="1"/>
      <text x="335" y="45" text-anchor="middle" fill="#e0f5f0" font-size="11">Apex League Panel</text>
      
      <rect x="440" y="20" width="150" height="40" rx="4" fill="rgba(15,184,159,0.15)" stroke="#0fb89f" stroke-width="1"/>
      <text x="515" y="45" text-anchor="middle" fill="#e0f5f0" font-size="11">Real-time Gauges</text>
      
      <rect x="620" y="20" width="150" height="40" rx="4" fill="rgba(15,184,159,0.15)" stroke="#0fb89f" stroke-width="1"/>
      <text x="695" y="45" text-anchor="middle" fill="#e0f5f0" font-size="11">Simulator Canvas</text>
      
      <rect x="800" y="20" width="120" height="40" rx="4" fill="rgba(15,184,159,0.15)" stroke="#0fb89f" stroke-width="1"/>
      <text x="860" y="45" text-anchor="middle" fill="#e0f5f0" font-size="11">WebSocket</text>
    </g>
    
    <!-- Connection lines from frontend -->
    <line x1="500" y1="110" x2="500" y2="150" stroke="#0fb89f" stroke-width="2" marker-end="url(#arrowhead)" opacity="0.5"/>
    
    <!-- API GATEWAY -->
    <g transform="translate(0, 150)">
      <rect x="200" y="0" width="600" height="70" rx="8" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="2"/>
      <text x="500" y="-10" text-anchor="middle" fill="#3b82f6" font-size="12" font-weight="bold" letter-spacing="2">API GATEWAY (Kong/Nginx)</text>
      
      <text x="280" y="30" text-anchor="middle" fill="#7aa8a0" font-size="10">Rate Limiting</text>
      <text x="400" y="30" text-anchor="middle" fill="#7aa8a0" font-size="10">JWT Auth</text>
      <text x="500" y="30" text-anchor="middle" fill="#7aa8a0" font-size="10">Load Balancing</text>
      <text x="620" y="30" text-anchor="middle" fill="#7aa8a0" font-size="10">SSL/TLS</text>
      <text x="720" y="30" text-anchor="middle" fill="#7aa8a0" font-size="10">gRPC Proxy</text>
      
      <!-- Protocol boxes -->
      <rect x="250" y="42" width="80" height="22" rx="3" fill="rgba(15,184,159,0.2)" stroke="#0fb89f" stroke-width="1"/>
      <text x="290" y="57" text-anchor="middle" fill="#0fb89f" font-size="9">REST</text>
      
      <rect x="360" y="42" width="80" height="22" rx="3" fill="rgba(236,72,153,0.2)" stroke="#ec4899" stroke-width="1"/>
      <text x="400" y="57" text-anchor="middle" fill="#ec4899" font-size="9">WebSocket</text>
      
      <rect x="470" y="42" width="80" height="22" rx="3" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1"/>
      <text x="510" y="57" text-anchor="middle" fill="#f59e0b" font-size="9">gRPC</text>
      
      <rect x="580" y="42" width="80" height="22" rx="3" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" stroke-width="1"/>
      <text x="620" y="57" text-anchor="middle" fill="#8b5cf6" font-size="9">GraphQL</text>
    </g>
    
    <!-- Connection lines to services -->
    {#each [250, 350, 450, 550, 650, 750] as x, i}
      <line x1={x} y1="220" x2={x} y2="280" stroke="rgba(15,184,159,0.3)" stroke-width="1" stroke-dasharray="4,4"/>
    {/each}
    
    <!-- SERVICE MESH -->
    <g transform="translate(0, 250)">
      <rect x="100" y="30" width="800" height="35" rx="4" fill="rgba(139,92,246,0.08)" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="4,2"/>
      <text x="500" y="52" text-anchor="middle" fill="#8b5cf6" font-size="10" letter-spacing="1">SERVICE MESH (Istio) • mTLS • Service Discovery • Circuit Breaker</text>
    </g>
    
    <!-- MICROSERVICES -->
    <g transform="translate(0, 320)">
      <text x="500" y="-10" text-anchor="middle" fill="#0fb89f" font-size="12" font-weight="bold" letter-spacing="2">MICROSERVICES LAYER</text>
      
      {#each services as service, i}
        {@const x = 80 + (i % 4) * 220}
        {@const y = Math.floor(i / 4) * 100}
        <g 
          transform="translate({x}, {y})"
          on:mouseenter={() => hoveredService = service.id}
          on:mouseleave={() => hoveredService = null}
          style="cursor: pointer"
        >
          <rect 
            width="180" height="70" rx="6" 
            fill={hoveredService === service.id ? 'rgba(15,184,159,0.15)' : 'rgba(20,40,50,0.9)'}
            stroke={service.color}
            stroke-width={hoveredService === service.id ? 2 : 1}
            filter={hoveredService === service.id ? 'url(#glow)' : 'none'}
          />
          <circle cx="15" cy="15" r="6" fill={service.color}/>
          <text x="30" y="18" fill="#e0f5f0" font-size="11" font-weight="bold">{service.name}</text>
          <text x="15" y="38" fill="#7aa8a0" font-size="9">Port: {service.port}</text>
          <text x="15" y="52" fill="#5a7a80" font-size="9">{service.lang}</text>
          <rect x="100" y="35" width="70" height="20" rx="3" fill="rgba(52,211,153,0.2)"/>
          <text x="135" y="49" text-anchor="middle" fill="#34d399" font-size="8">HEALTHY</text>
        </g>
      {/each}
    </g>
    
    <!-- DATA LAYER -->
    <g transform="translate(0, 540)">
      <text x="500" y="-10" text-anchor="middle" fill="#0fb89f" font-size="12" font-weight="bold" letter-spacing="2">DATA LAYER</text>
      
      <!-- PostgreSQL -->
      <g transform="translate(150, 20)">
        <rect width="200" height="80" rx="6" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="2"/>
        <text x="100" y="25" text-anchor="middle" fill="#3b82f6" font-size="13" font-weight="bold">PostgreSQL</text>
        <text x="100" y="45" text-anchor="middle" fill="#7aa8a0" font-size="9">Primary Data Store</text>
        <text x="100" y="60" text-anchor="middle" fill="#5a7a80" font-size="9">Sessions • Scores • Telemetry</text>
        <rect x="130" y="65" width="60" height="12" rx="2" fill="rgba(52,211,153,0.3)"/>
        <text x="160" y="74" text-anchor="middle" fill="#34d399" font-size="7">99.9% UP</text>
      </g>
      
      <!-- Redis -->
      <g transform="translate(400, 20)">
        <rect width="200" height="80" rx="6" fill="rgba(239,68,68,0.1)" stroke="#ef4444" stroke-width="2"/>
        <text x="100" y="25" text-anchor="middle" fill="#ef4444" font-size="13" font-weight="bold">Redis Cluster</text>
        <text x="100" y="45" text-anchor="middle" fill="#7aa8a0" font-size="9">Caching & Real-time</text>
        <text x="100" y="60" text-anchor="middle" fill="#5a7a80" font-size="9">Leaderboard • Sessions • Pub/Sub</text>
        <rect x="60" y="65" width="80" height="12" rx="2" fill="rgba(52,211,153,0.3)"/>
        <text x="100" y="74" text-anchor="middle" fill="#34d399" font-size="7">&lt;10ms LATENCY</text>
      </g>
      
      <!-- TimescaleDB -->
      <g transform="translate(650, 20)">
        <rect width="200" height="80" rx="6" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="2"/>
        <text x="100" y="25" text-anchor="middle" fill="#f59e0b" font-size="13" font-weight="bold">TimescaleDB</text>
        <text x="100" y="45" text-anchor="middle" fill="#7aa8a0" font-size="9">Time-Series Analytics</text>
        <text x="100" y="60" text-anchor="middle" fill="#5a7a80" font-size="9">Metrics • Waveforms • Trends</text>
        <rect x="60" y="65" width="80" height="12" rx="2" fill="rgba(52,211,153,0.3)"/>
        <text x="100" y="74" text-anchor="middle" fill="#34d399" font-size="7">PARTITIONED</text>
      </g>
    </g>
    
    <!-- Latency indicators -->
    <g transform="translate(920, 150)">
      <rect x="0" y="0" width="70" height="120" rx="4" fill="rgba(0,0,0,0.3)" stroke="rgba(15,184,159,0.3)" stroke-width="1"/>
      <text x="35" y="18" text-anchor="middle" fill="#0fb89f" font-size="8" font-weight="bold">LATENCY</text>
      
      <text x="10" y="38" fill="#34d399" font-size="8">API</text>
      <text x="60" y="38" text-anchor="end" fill="#34d399" font-size="9">&lt;50ms</text>
      
      <text x="10" y="55" fill="#fbbf24" font-size="8">Score</text>
      <text x="60" y="55" text-anchor="end" fill="#fbbf24" font-size="9">&lt;100ms</text>
      
      <text x="10" y="72" fill="#60a5fa" font-size="8">Board</text>
      <text x="60" y="72" text-anchor="end" fill="#60a5fa" font-size="9">&lt;200ms</text>
      
      <text x="10" y="89" fill="#a78bfa" font-size="8">WS</text>
      <text x="60" y="89" text-anchor="end" fill="#a78bfa" font-size="9">&lt;30ms</text>
      
      <text x="10" y="106" fill="#f472b6" font-size="8">Cache</text>
      <text x="60" y="106" text-anchor="end" fill="#f472b6" font-size="9">&lt;10ms</text>
    </g>
  </svg>
  
  <!-- Service details tooltip -->
  {#if hoveredService}
    {@const service = services.find(s => s.id === hoveredService)}
    <div class="service-tooltip">
      <h4>{service.name}</h4>
      <p>Port: {service.port}</p>
      <p>Stack: {service.lang}</p>
    </div>
  {/if}
</div>

<style>
  .architecture-container {
    background: linear-gradient(135deg, #0a1520, #0d1f28);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(15, 184, 159, 0.2);
  }
  
  .diagram-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #e0f5f0;
    text-align: center;
    margin: 0 0 4px;
  }
  
  .diagram-subtitle {
    font-size: 12px;
    color: #7aa8a0;
    text-align: center;
    margin: 0 0 20px;
  }
  
  .architecture-svg {
    width: 100%;
    max-width: 1000px;
    height: auto;
    display: block;
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .service-tooltip {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(15, 35, 50, 0.95);
    border: 1px solid rgba(15, 184, 159, 0.4);
    border-radius: 8px;
    padding: 12px 16px;
    z-index: 100;
  }
  
  .service-tooltip h4 {
    margin: 0 0 8px;
    color: #0fb89f;
    font-size: 14px;
  }
  
  .service-tooltip p {
    margin: 4px 0;
    color: #7aa8a0;
    font-size: 12px;
  }
</style>
