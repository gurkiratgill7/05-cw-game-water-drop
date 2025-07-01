document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const gameContainer = document.getElementById('game-container');
    const hud = { day: document.getElementById('day-stat'), health: document.getElementById('health-stat'), water: document.getElementById('water-stat'), waterType: document.getElementById('water-type-stat') };
    const screens = { start: document.getElementById('start-screen'), journey: document.getElementById('journey-screen'), filterChoice: document.getElementById('filter-choice-screen'), allocation: document.getElementById('allocation-screen'), summary: document.getElementById('summary-screen'), gameOver: document.getElementById('game-over-screen') };
    const player = document.getElementById('player');
    const endHouse = document.getElementById('end-house');
    const filterChoiceUI = { collectedWater: document.getElementById('collected-water-stat'), filterNowBtn: document.getElementById('filter-now-btn'), useDirtyBtn: document.getElementById('use-dirty-btn') };
    const allocationUI = { cropStat: document.getElementById('crop-stat'), drinkBtn: document.getElementById('drink-btn'), cookBtn: document.getElementById('cook-btn'), cropsBtn: document.getElementById('crops-btn'), hygieneBtn: document.getElementById('hygiene-btn'), finishDayBtn: document.getElementById('finish-day-btn') };
    const summaryUI = { day: document.getElementById('summary-day'), text: document.getElementById('summary-text') };
    const gameOverUI = { reason: document.getElementById('game-over-reason'), finalDays: document.getElementById('final-days') };
    const buttons = { start: document.getElementById('start-game-btn'), nextDay: document.getElementById('next-day-btn'), playAgain: document.getElementById('play-again-btn') };
    const difficultyButtons = { easy: document.getElementById('easy-btn'), medium: document.getElementById('medium-btn'), hard: document.getElementById('hard-btn') };

    // --- GAME STATE & CONSTANTS ---
    let gameState = {};
    const PLAYER_JUMP_VELOCITY = 22, GRAVITY = 1.0, SICKNESS_CHANCE = 0.6;
    const DIFFICULTY_SETTINGS = {
        easy: { duration: 20000, obstacleInterval: 3000, randomSpawn: false },
        medium: { duration: 30000, obstacleInterval: 2200, randomSpawn: false },
        hard: { duration: 45000, obstacleInterval: 1500, randomSpawn: true, minSpawnGap: 1000 }
    };
    let journeyIntervals = [], playerVelocityY = 0, isJumping = false, isJourneyActive = false, dayChoices = {};
    let selectedDifficulty = null, lastObstacleSpawn = 0;

    function init() {
        gameState = { day: 0, health: 100, water: 0, cropHealth: 50, isWaterClean: false, isGameOver: false };
        selectedDifficulty = null;
        endHouse.classList.remove('visible');
        switchScreen('start');
        updateHUD();
        updateStartButton();
    }

    function selectDifficulty(difficulty) {
        selectedDifficulty = difficulty;
        Object.values(difficultyButtons).forEach(btn => btn.classList.remove('selected'));
        difficultyButtons[difficulty].classList.add('selected');
        updateStartButton();
    }

    function updateStartButton() {
        buttons.start.disabled = !selectedDifficulty;
    }

    function switchScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.remove('active')); if (screens[screenName]) screens[screenName].classList.add('active'); }

    function startGame() {
        if (gameState.isGameOver || !selectedDifficulty) return;
        gameState.day++;
        isJourneyActive = true;
        endHouse.classList.remove('visible');
        player.classList.remove('standing');
        switchScreen('journey');
        startJourney();
    }

    function startJourney() {
        const difficulty = DIFFICULTY_SETTINGS[selectedDifficulty];
        gameState.water = 5.0; isJumping = false; playerVelocityY = 0; player.style.bottom = '16%';
        lastObstacleSpawn = 0;
        updateHUD();
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        const runAnim = setInterval(() => { player.style.backgroundImage = player.style.backgroundImage.includes('1') ? "url('img/stickman-running-2.png')" : "url('img/stickman-running-1.png')"; }, 150);
        
        let obstacleSpawner;
        if (difficulty.randomSpawn) {
            obstacleSpawner = setInterval(() => {
                const now = Date.now();
                if (now - lastObstacleSpawn >= difficulty.minSpawnGap) {
                    if (Math.random() < 0.7) { // 30% chance to spawn each interval
                        createObstacle();
                        lastObstacleSpawn = now;
                    }
                }
            }, 500); // Check every 500ms for random spawning
        } else {
            obstacleSpawner = setInterval(createObstacle, difficulty.obstacleInterval);
        }
        
        const journeyTimer = setTimeout(endJourney, difficulty.duration);
        journeyIntervals = [runAnim, obstacleSpawner, journeyTimer];
        requestAnimationFrame(journeyLoop);
    }
    
    // ##### THE BUG FIX IS IN THIS FUNCTION #####
    function journeyLoop() {
        if (!isJourneyActive) return;

        if (isJumping) {
            playerVelocityY -= GRAVITY;
            let currentBottom = parseFloat(player.style.bottom);
            let nextBottom = currentBottom + playerVelocityY;

            // Check if the next position will be at or below the ground
            if (nextBottom <= 16) {
                player.style.bottom = '16%'; // Clamp to ground
                isJumping = false;
                playerVelocityY = 0; // Reset velocity
                player.classList.remove('jump');
            } else {
                player.style.bottom = `${nextBottom}px`; // Apply new position
            }
        }

        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.style.left = `${obstacle.offsetLeft - 5}px`;
            const pRect = player.getBoundingClientRect(), oRect = obstacle.getBoundingClientRect();
            if (pRect.right > oRect.left && pRect.left < oRect.right && pRect.bottom > oRect.top && pRect.top < oRect.bottom) {
                // Check if player is on the ground (collision while not jumping high enough)
                const playerBottom = parseFloat(player.style.bottom);
                if (playerBottom <= 25) { // Player is close to ground level, penalize for collision
                    obstacle.remove(); 
                    gameState.water = Math.max(0, gameState.water - 0.25); 
                    updateHUD();
                    if (gameState.water === 0 && !gameState.isGameOver) gameOver("You lost all your water during the journey.");
                }
                else {
                    obstacle.remove();
                    gameState.water = Math.max(0, gameState.water - 0.25); 
                    updateHUD();
                    if (gameState.water === 0 && !gameState.isGameOver) gameOver("You lost all your water during the journey.");

                }
            }
            if (obstacle.offsetLeft < -50) obstacle.remove();
        });
        requestAnimationFrame(journeyLoop);
    }

    function endJourney() {
        isJourneyActive = false;
        journeyIntervals.forEach(clearInterval);
        player.classList.add('standing');
        endHouse.classList.add('visible');
        setTimeout(() => {
            if (gameState.isGameOver) return;
            filterChoiceUI.collectedWater.textContent = gameState.water.toFixed(1);
            switchScreen('filterChoice');
        }, 2000);
    }

    function handleFilterChoice(shouldFilter) {
        if (shouldFilter) {
            gameState.water *= 0.75;
            gameState.isWaterClean = true;
        } else {
            gameState.isWaterClean = false;
        }
        updateHUD();
        setupAllocation();
        switchScreen('allocation');
    }

    function setupAllocation() {
        dayChoices = { drank: false, cooked: false, wateredCrops: false, washed: false };
        Object.values(allocationUI).forEach(el => { if (el.tagName === 'BUTTON') el.disabled = false; });
        allocationUI.cropStat.textContent = Math.round(gameState.cropHealth);
        const waterType = gameState.isWaterClean ? "Clean" : "Dirty";
        allocationUI.drinkBtn.textContent = `Drink (Cost: 1.0L ${waterType})`;
        allocationUI.cookBtn.textContent = `Cook Food (Cost: 1.5L ${waterType})`;
        allocationUI.cropsBtn.textContent = `Water Crops (Cost: 1.0L ${waterType})`;
        allocationUI.hygieneBtn.textContent = `Hygiene (Cost: 1.0L ${waterType})`;
        allocationUI.drinkBtn.classList.toggle('risky-btn', !gameState.isWaterClean);
        updateAllocationButtons();
    }

    function handleAllocation(choice) {
        const cost = parseFloat(choice.dataset.cost);
        if (gameState.water >= cost) {
            gameState.water -= cost;
            choice.disabled = true;
            const actionId = choice.id;
            if (actionId === 'drink-btn') { dayChoices.drank = true; }
            if (actionId === 'cook-btn') { dayChoices.cooked = true; }
            if (actionId === 'crops-btn') { dayChoices.wateredCrops = true; }
            if (actionId === 'hygiene-btn') { dayChoices.washed = true; }
        }
        updateHUD();
        updateAllocationButtons();
    }

    function updateAllocationButtons() {
        Object.values(allocationUI).forEach(btn => {
            if (btn.tagName === 'BUTTON' && btn.dataset.cost && !btn.disabled) {
                btn.disabled = gameState.water < parseFloat(btn.dataset.cost);
            }
        });
    }
    
    function finishDay() {
        let summary = "";
        if (dayChoices.drank) {
             summary += "You managed to drink today. ";
            if (!gameState.isWaterClean && Math.random() < SICKNESS_CHANCE) { 
                gameState.health -= 35; 
                summary += "But the dirty water made you violently ill! "; 
            } else {
                gameState.health = Math.min(100, gameState.health + 10); 
            } 
        } else { 
            gameState.health -= 25; 
            summary += "You went the whole day without drinking. Dehydration is setting in. "; 
        }
        if (dayChoices.cooked) { 
            if (gameState.cropHealth >= 20) { 
                gameState.health = Math.min(100, gameState.health + 15); 
                gameState.cropHealth -= 10; 
                summary += "You cooked a decent meal. "; 
            } else { 
                gameState.health -= 15; 
                summary += "You cooked, but had almost no food to prepare. "; 
            } 
        } else { 
            gameState.health -= 15; 
            summary += "With no water to cook, you went hungry. "; 
        }
        if (dayChoices.wateredCrops) { 
            gameState.cropHealth = Math.min(100, gameState.cropHealth + 25); 
            summary += "The crops were watered. "; 
        } else { 
            gameState.cropHealth -= 20; 
            summary += "The crops are dry and wilting. "; 
        }
        if (dayChoices.washed) { 
            gameState.health = Math.min(100, gameState.health + 5);
            summary += "You washed your hands, staving off other illnesses. "; 
        } else { 
            gameState.health -= 10; 
            summary += "Poor hygiene adds to your health troubles. "; 
        }
        gameState.cropHealth = Math.max(0, gameState.cropHealth); gameState.health = Math.max(0, gameState.health);
        summaryUI.day.textContent = gameState.day; summaryUI.text.textContent = summary;
        switchScreen('summary'); updateHUD();
        if (gameState.health <= 0) { gameOver("Your health reached zero."); }
    }

    function gameOver(reason) {
        gameState.isGameOver = true; isJourneyActive = false; journeyIntervals.forEach(clearInterval);
        gameOverUI.reason.textContent = reason; gameOverUI.finalDays.textContent = gameState.day;
        switchScreen('gameOver');
    }

    function updateHUD() {
        hud.day.textContent = gameState.day; hud.health.textContent = Math.round(gameState.health);
        hud.water.textContent = gameState.water.toFixed(1); hud.waterType.textContent = gameState.isWaterClean ? "Clean" : "Dirty";
    }

    function createObstacle() {
        if (!isJourneyActive) return;
        const obs = document.createElement('div'); obs.className = 'obstacle';
        obs.style.left = `${gameContainer.offsetWidth}px`;
        obs.style.backgroundImage = `url('img/rock-${Math.floor(Math.random() * 4) + 1}.png')`;
        screens.journey.appendChild(obs);
    }

    function handleJump() {
        if (!isJumping && isJourneyActive) { isJumping = true; player.classList.add('jump'); playerVelocityY = PLAYER_JUMP_VELOCITY; }
    }

    buttons.start.addEventListener('click', startGame);
    buttons.nextDay.addEventListener('click', startGame);
    buttons.playAgain.addEventListener('click', init);
    filterChoiceUI.filterNowBtn.addEventListener('click', () => handleFilterChoice(true));
    filterChoiceUI.useDirtyBtn.addEventListener('click', () => handleFilterChoice(false));
    allocationUI.finishDayBtn.addEventListener('click', finishDay);
    Object.values(allocationUI).forEach(btn => { if (btn.dataset.cost) btn.addEventListener('click', () => handleAllocation(btn)); });
    Object.values(difficultyButtons).forEach(btn => btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty)));
    gameContainer.addEventListener('click', handleJump);
    window.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleJump(); } });

    init();
});