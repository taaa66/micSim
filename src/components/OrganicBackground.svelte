<script>
  import { onMount } from 'svelte';
  
  let canvas;
  let ctx;
  let animationFrame;
  let time = 0;
  let particles = [];
  
  // Golden Ratio
  const PHI = 1.618033988749895;
  
  class Particle {
    constructor(x, y, index) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.index = index;
      this.angle = (index / 50) * Math.PI * 2;
      this.radius = 150 + (index % 3) * 50;
      this.speed = 0.0005 + (index % 5) * 0.0002;
      this.size = 1 + Math.random() * 2;
      this.opacity = 0.2 + Math.random() * 0.3;
    }
    
    update(time) {
      // Organic movement using multiple sine waves
      const offset1 = Math.sin(time * this.speed + this.angle) * 20;
      const offset2 = Math.cos(time * this.speed * PHI + this.angle * PHI) * 15;
      
      this.x = this.baseX + offset1;
      this.y = this.baseY + offset2;
    }
    
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(168, 76%, 42%, ${this.opacity * 0.6})`;
      ctx.fill();
    }
  }
  
  onMount(() => {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    initParticles();
    animate();
    
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function initParticles() {
    particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create particles in organic spiral pattern
    for (let i = 0; i < 80; i++) {
      const angle = i * PHI * Math.PI * 2;
      const radius = Math.sqrt(i) * 30;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      particles.push(new Particle(x, y, i));
    }
  }
  
  function drawConnections() {
    // Draw subtle connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / 120) * 0.1;
          ctx.strokeStyle = `hsla(180, 60%, 60%, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  
  function drawGoldenSpiral() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.beginPath();
    ctx.strokeStyle = `hsla(168, 76%, 42%, ${0.03 + Math.sin(time * 0.5) * 0.02})`;
    ctx.lineWidth = 1;
    
    let angle = 0;
    let radius = 5;
    
    for (let i = 0; i < 200; i++) {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      angle += 0.1;
      radius *= 1.01; // Exponential growth
    }
    
    ctx.stroke();
  }
  
  function animate() {
    time += 1;
    
    // Clear with transparent to let CSS background show through
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw golden spiral (very subtle)
    drawGoldenSpiral();
    
    // Update and draw particles
    particles.forEach(p => {
      p.update(time);
      p.draw(ctx);
    });
    
    // Draw connections
    drawConnections();
    
    animationFrame = requestAnimationFrame(animate);
  }
</script>

<canvas bind:this={canvas} class="organic-bg"></canvas>

<style>
  .organic-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    opacity: 0.6;
  }
</style>
