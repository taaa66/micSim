<script lang="ts">
  /**
   * =============================================================================
   * OKAP GAME ENGINE - Universal Game Container
   * =============================================================================
   * Handles timing, scoring, feedback, and state management for all game types
   * =============================================================================
   */
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';
  import { OKAP_TIMING, OKAP_SCORING, OKAP_GRADES, calculateGrade, calculateScore, type OKAPGame } from './okapConstants';

  export let game: OKAPGame;
  export let questions: any[] = [];
  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: GameResult) => void) | null = null;

  interface GameResult {
    gameId: string;
    score: number;
    correct: number;
    total: number;
    accuracy: number;
    avgTimeMs: number;
    grade: string;
    streak: number;
  }

  const dispatch = createEventDispatcher();

  // Game state
  let gameState: 'ready' | 'countdown' | 'playing' | 'feedback' | 'complete' = 'ready';
  let currentQuestionIndex = 0;
  let countdown = OKAP_TIMING.COUNTDOWN_START;
  
  // Scoring
  let score = 0;
  let correctAnswers = 0;
  let streak = 0;
  let maxStreak = 0;
  let totalTimeMs = 0;
  
  // Timer
  let timeRemaining = OKAP_TIMING.QUESTION_TIME_MS;
  let questionStartTime = 0;
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  
  // Feedback
  let lastAnswerCorrect = false;
  let feedbackMessage = '';

  // Current question
  $: currentQuestion = questions[currentQuestionIndex];
  $: progress = ((currentQuestionIndex) / questions.length) * 100;
  $: timeProgress = (timeRemaining / OKAP_TIMING.QUESTION_TIME_MS) * 100;

  function startGame() {
    gameState = 'countdown';
    countdown = OKAP_TIMING.COUNTDOWN_START;
    
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        beginQuestion();
      }
    }, 1000);
  }

  function beginQuestion() {
    gameState = 'playing';
    timeRemaining = OKAP_TIMING.QUESTION_TIME_MS;
    questionStartTime = Date.now();
    
    timerInterval = setInterval(() => {
      timeRemaining -= 100;
      if (timeRemaining <= 0) {
        handleTimeout();
      }
    }, 100);
  }

  function handleTimeout() {
    if (timerInterval) clearInterval(timerInterval);
    streak = 0;
    lastAnswerCorrect = false;
    feedbackMessage = 'Time\'s up!';
    showFeedback();
  }

  export function submitAnswer(isCorrect: boolean) {
    if (gameState !== 'playing') return;
    if (timerInterval) clearInterval(timerInterval);
    
    const answerTime = Date.now() - questionStartTime;
    totalTimeMs += answerTime;
    
    lastAnswerCorrect = isCorrect;
    
    if (isCorrect) {
      correctAnswers++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
      
      // Calculate points with speed bonus
      const speedFactor = Math.max(0, 1 - (answerTime / OKAP_TIMING.QUESTION_TIME_MS));
      const speedBonus = Math.round(speedFactor * OKAP_SCORING.SPEED_BONUS_MAX);
      const streakMultiplier = Math.min(1 + (streak * OKAP_SCORING.STREAK_MULTIPLIER), OKAP_SCORING.MAX_STREAK_BONUS);
      const points = Math.round((OKAP_SCORING.CORRECT_BASE + speedBonus) * streakMultiplier);
      
      score += points;
      feedbackMessage = `+${points} points!`;
      
      if (answerTime < OKAP_TIMING.BONUS_TIME_THRESHOLD_MS) {
        feedbackMessage += ' ⚡ Fast!';
      }
      if (streak >= 3) {
        feedbackMessage += ` 🔥 Streak ${streak}!`;
      }
    } else {
      streak = 0;
      feedbackMessage = 'Incorrect';
    }
    
    showFeedback();
  }

  function showFeedback() {
    gameState = 'feedback';
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        beginQuestion();
      } else {
        endGame();
      }
    }, OKAP_TIMING.FEEDBACK_DELAY_MS);
  }

  function endGame() {
    gameState = 'complete';
    
    const accuracy = (correctAnswers / questions.length) * 100;
    const avgTimeMs = totalTimeMs / questions.length;
    const grade = calculateGrade(accuracy);
    
    // Perfect game bonus
    if (correctAnswers === questions.length) {
      score += OKAP_SCORING.PERFECT_GAME_BONUS;
    }
    
    const result: GameResult = {
      gameId: game.id,
      score,
      correct: correctAnswers,
      total: questions.length,
      accuracy,
      avgTimeMs,
      grade,
      streak: maxStreak
    };
    
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (timerInterval) clearInterval(timerInterval);
    if (onBack) onBack();
    dispatch('back');
  }

  function restartGame() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    streak = 0;
    maxStreak = 0;
    totalTimeMs = 0;
    startGame();
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<div class="game-engine" style="--accent: {game ? '#0fb89f' : '#0fb89f'};">
  <!-- Header -->
  <header class="game-header">
    <button class="back-btn" on:click={handleBack}>✕</button>
    
    <div class="game-info">
      <span class="game-icon">{game?.icon || '📚'}</span>
      <div>
        <h2>{game?.name || 'Game'}</h2>
        <span class="game-code">{game?.code || ''}</span>
      </div>
    </div>
    
    <div class="score-display">
      <span class="score-value">{score}</span>
      <span class="score-label">Points</span>
    </div>
  </header>

  <!-- Progress Bar -->
  {#if gameState === 'playing' || gameState === 'feedback'}
    <div class="progress-container">
      <div class="question-progress">
        <div class="progress-fill" style="width: {progress}%"></div>
      </div>
      <span class="question-counter">{currentQuestionIndex + 1} / {questions.length}</span>
    </div>
    
    <!-- Timer Bar -->
    <div class="timer-bar" class:warning={timeRemaining < 5000} class:danger={timeRemaining < 2000}>
      <div class="timer-fill" style="width: {timeProgress}%"></div>
    </div>
  {/if}

  <!-- Game Content Area -->
  <div class="game-content">
    {#if gameState === 'ready'}
      <div class="ready-screen" in:scale={{ duration: 400, easing: elasticOut }}>
        <div class="ready-icon">{game?.icon || '📚'}</div>
        <h1>{game?.name || 'Game'}</h1>
        <p class="ready-desc">{game?.description || ''}</p>
        
        <div class="ready-meta">
          <div class="meta-item">
            <span class="meta-icon">❓</span>
            <span>{questions.length} Questions</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span>15 sec per question</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🎯</span>
            <span>{game?.okapFact || ''}</span>
          </div>
        </div>
        
        <button class="start-btn" on:click={startGame}>
          ▶ Start Game
        </button>
      </div>
      
    {:else if gameState === 'countdown'}
      <div class="countdown-screen" in:scale={{ duration: 300 }}>
        {#key countdown}
          <div class="countdown-number" in:scale={{ duration: 300 }}>
            {countdown}
          </div>
        {/key}
        <p>Get Ready...</p>
      </div>
      
    {:else if gameState === 'playing' || gameState === 'feedback'}
      <div class="question-area">
        <!-- Streak indicator -->
        {#if streak >= 2}
          <div class="streak-indicator" in:fly={{ y: -20, duration: 300 }}>
            🔥 Streak {streak}
          </div>
        {/if}
        
        <!-- Question content slot -->
        <slot 
          name="question" 
          question={currentQuestion}
          {submitAnswer}
          disabled={gameState === 'feedback'}
        />
        
        <!-- Feedback overlay -->
        {#if gameState === 'feedback'}
          <div 
            class="feedback-overlay"
            class:correct={lastAnswerCorrect}
            class:wrong={!lastAnswerCorrect}
            in:scale={{ duration: 200 }}
          >
            <span class="feedback-icon">{lastAnswerCorrect ? '✓' : '✗'}</span>
            <span class="feedback-message">{feedbackMessage}</span>
          </div>
        {/if}
      </div>
      
    {:else if gameState === 'complete'}
      <div class="complete-screen" in:scale={{ duration: 400, easing: elasticOut }}>
        <div class="result-grade" style="color: {OKAP_GRADES[calculateGrade((correctAnswers / questions.length) * 100)]?.color}">
          {calculateGrade((correctAnswers / questions.length) * 100)}
        </div>
        
        <h1>Game Complete!</h1>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{score}</span>
            <span class="stat-label">Score</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{correctAnswers}/{questions.length}</span>
            <span class="stat-label">Correct Answers</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{Math.round((correctAnswers / questions.length) * 100)}%</span>
            <span class="stat-label">Accuracy</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{maxStreak}</span>
            <span class="stat-label">Best Streak</span>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="action-btn primary" on:click={restartGame}>
            🔄 Play Again
          </button>
          <button class="action-btn secondary" on:click={handleBack}>
            ← Back to Menu
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .game-engine {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1015 0%, #151f28 100%);
    display: flex;
    flex-direction: column;
    direction: ltr;
  }

  .game-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .back-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #7aa8a0;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0f5f0;
  }

  .game-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .game-icon {
    font-size: 2rem;
  }

  .game-info h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #e0f5f0;
  }

  .game-code {
    font-size: 0.7rem;
    color: var(--accent);
    font-weight: 600;
  }

  .score-display {
    text-align: center;
    padding: 0.5rem 1rem;
    background: rgba(15, 184, 159, 0.1);
    border-radius: 8px;
  }

  .score-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #34d399;
  }

  .score-label {
    font-size: 0.7rem;
    color: #7aa8a0;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
  }

  .question-progress {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0fb89f, #34d399);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .question-counter {
    font-size: 0.85rem;
    color: #7aa8a0;
    font-weight: 600;
    min-width: 50px;
    text-align: left;
  }

  .timer-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: #34d399;
    transition: width 0.1s linear;
  }

  .timer-bar.warning .timer-fill {
    background: #fbbf24;
  }

  .timer-bar.danger .timer-fill {
    background: #ef4444;
    animation: pulse-danger 0.5s ease-in-out infinite;
  }

  @keyframes pulse-danger {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .game-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
  }

  /* Ready Screen */
  .ready-screen {
    text-align: center;
    max-width: 500px;
  }

  .ready-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .ready-screen h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    color: #e0f5f0;
  }

  .ready-desc {
    margin: 0 0 2rem;
    color: #7aa8a0;
    font-size: 1rem;
  }

  .ready-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    font-size: 0.9rem;
    color: #e0f5f0;
  }

  .meta-icon {
    font-size: 1.2rem;
  }

  .start-btn {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: #0a1015;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(15, 184, 159, 0.3);
  }

  /* Countdown */
  .countdown-screen {
    text-align: center;
  }

  .countdown-number {
    font-size: 8rem;
    font-weight: 800;
    color: #0fb89f;
    text-shadow: 0 0 50px rgba(15, 184, 159, 0.5);
    animation: countdown-pulse 1s ease-in-out;
  }

  @keyframes countdown-pulse {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  .countdown-screen p {
    font-size: 1.2rem;
    color: #7aa8a0;
  }

  /* Question Area */
  .question-area {
    width: 100%;
    max-width: 800px;
    position: relative;
  }

  .streak-indicator {
    position: absolute;
    top: -40px;
    right: 50%;
    transform: translateX(50%);
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: #0a1015;
    font-weight: 700;
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .feedback-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 16px;
    z-index: 10;
  }

  .feedback-overlay.correct {
    background: rgba(16, 185, 129, 0.2);
    border: 2px solid #10b981;
  }

  .feedback-overlay.wrong {
    background: rgba(239, 68, 68, 0.2);
    border: 2px solid #ef4444;
  }

  .feedback-icon {
    font-size: 4rem;
    margin-bottom: 0.5rem;
  }

  .feedback-overlay.correct .feedback-icon {
    color: #10b981;
  }

  .feedback-overlay.wrong .feedback-icon {
    color: #ef4444;
  }

  .feedback-message {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0f5f0;
  }

  /* Complete Screen */
  .complete-screen {
    text-align: center;
    max-width: 500px;
  }

  .result-grade {
    font-size: 6rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 30px currentColor;
  }

  .complete-screen h1 {
    margin: 0 0 2rem;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .result-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-item {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #0fb89f;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #7aa8a0;
  }

  .result-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .action-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #0fb89f, #34d399);
    color: #0a1015;
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #e0f5f0;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .action-btn:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .game-header {
      padding: 0.75rem 1rem;
    }

    .game-info h2 {
      font-size: 0.9rem;
    }

    .game-content {
      padding: 1rem;
    }

    .result-stats {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
