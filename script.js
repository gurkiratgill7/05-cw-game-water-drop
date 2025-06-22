document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const gameContainer = document.getElementById('game-container');
    const hud = { /* ... */ }; // (Same as before)
    const screens = { /* ... */ }; // (Same as before)
    const player = document.getElementById('player');
    const endHouse = document.getElementById('end-house'); // NEW
    const filterChoiceUI = { /* ... */ }; // (Same as before)
    const allocationUI = { /* ... */ }; // (Same as before)
    const summaryUI = { /* ... */ }; // (Same as before)
    const gameOverUI = { /* ... */ }; // (Same as before)
    const buttons = { /* ... */ }; // (Same as before)
    // (Copy-paste your old variable declarations here to save space)

    // --- GAME STATE & CONSTANTS ---
    let gameState = {};
    const PLAYER_JUMP_VELOCITY = 22, GRAVITY = 0.9, JOURNEY_DURATION = 25000, OBSTACLE_INTERVAL = 1800, SICKNESS_CHANCE = 0.6;
    let journeyIntervals = [], playerVelocityY = 0, isJumping = false, isJourneyActive = false, dayChoices = {};

    function init() {
        gameState = { day: 0, health: 100, water: 0, cropHealth: 50, isWaterClean: false, isGameOver: false };
        endHouse.classList.remove('visible'); // Ensure house is hidden
        switchScreen('start');
        updateHUD();
    }

    function switchScreen(screenName) { /* ... (Same as before) */ }

    function startGame() {
        if (gameState.isGameOver) return;
        gameState.day++;
        isJourneyActive = true;
        endHouse.classList.remove('visible'); // Reset house position
        player.classList.remove('standing');
        switchScreen('journey');
        startJourney();
    }

    function startJourney() { /* ... (Same as before, but ensure playerVelocityY is reset here) */ }
    
    function journeyLoop() {
        if (!isJourneyActive) return; // Use the flag to stop the loop
        // ... (The rest of the physics and collision logic is the same)
        requestAnimationFrame(journeyLoop);
    }

    // UPDATED: endJourney function
    function endJourney() {
        isJourneyActive = false; // Stops the journeyLoop
        journeyIntervals.forEach(clearInterval);
        player.classList.add('standing'); // Stop running animation

        // Animate the house into view
        endHouse.classList.add('visible');

        // After the house animation finishes, show the filter choice modal
        setTimeout(() => {
            if (gameState.isGameOver) return; // Don't show modal if game over
            filterChoiceUI.collectedWater.textContent = gameState.water.toFixed(1);
            switchScreen('filterChoice');
        }, 2000); // 2 seconds, to allow for house animation
    }

    function handleFilterChoice(shouldFilter) { /* ... (Same as before) */ }
    function setupAllocation() { /* ... (Same as before) */ }

    // UPDATED: handleAllocation for robust button disabling
    function handleAllocation(choice) {
        const cost = parseFloat(choice.dataset.cost);
        if (gameState.water >= cost) {
            gameState.water -= cost;
            choice.disabled = true; // FIX: Disable button immediately on successful use

            const action = choice.id.replace('-btn', '');
            if (action === 'drink') {
                dayChoices.drank = true;
            } else {
                dayChoices[action] = true;
            }
        }
        updateHUD();
        updateAllocationButtons(); // Update affordability of other buttons
    }

    // UPDATED: updateAllocationButtons simplified logic
    function updateAllocationButtons() {
        Object.values(allocationUI).forEach(btn => {
            if (btn.tagName === 'BUTTON' && btn.dataset.cost && !btn.disabled) {
                // Only check affordability for buttons that are not already disabled
                btn.disabled = gameState.water < parseFloat(btn.dataset.cost);
            }
        });
    }
    
    function finishDay() { /* ... (Same as before) */ }
    function gameOver(reason) { /* ... (Same as before) */ }
    function updateHUD() { /* ... (Same from previous versions) */ }
    function createObstacle() { /* ... (Same from previous versions) */ }
    
    function handleJump() {
        if (!isJumping && isJourneyActive) { // Check if journey is active
            isJumping = true;
            player.classList.add('jump');
            playerVelocityY = PLAYER_JUMP_VELOCITY;
        }
    }

    // --- EVENT LISTENERS ---
    // (This section is identical to the previous version, no changes needed)
    // ...

    // --- INITIALIZE GAME ---
    init();

    // To make copy-pasting easier, here are the full contents for the functions that were collapsed
    // You can copy this whole block over your existing script.js
    
    // Full script.js content:
    (function() {
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

        let gameState = {};
        const PLAYER_JUMP_VELOCITY = 22, GRAVITY = 0.9, JOURNEY_DURATION = 25000, OBSTACLE_INTERVAL = 1800, SICKNESS_CHANCE = 0.6;
        let journeyIntervals = [], playerVelocityY = 0, isJumping = false, isJourneyActive = false, dayChoices = {};

        function init() {
            gameState = { day: 0, health: 100, water: 0, cropHealth: 50, isWaterClean: false, isGameOver: false };
            endHouse.classList.remove('visible');
            switchScreen('start');
            updateHUD();
        }

        function switchScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.remove('active')); if (screens[screenName]) screens[screenName].classList.add('active'); }

        function startGame() {
            if (gameState.isGameOver) return;
            gameState.day++;
            isJourneyActive = true;
            endHouse.classList.remove('visible');
            player.classList.remove('standing');
            switchScreen('journey');
            startJourney();
        }

        function startJourney() {
            gameState.water = 5.0; isJumping = false; playerVelocityY = 0; player.style.bottom = '16%';
            updateHUD();
            document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
            const runAnim = setInterval(() => { player.style.backgroundImage = player.style.backgroundImage.includes('1') ? "url('img/stickman-running-2.png')" : "url('img/stickman-running-1.png')"; }, 150);
            const obstacleSpawner = setInterval(createObstacle, OBSTACLE_INTERVAL);
            const journeyTimer = setTimeout(endJourney, JOURNEY_DURATION);
            journeyIntervals = [runAnim, obstacleSpawner, journeyTimer];
            requestAnimationFrame(journeyLoop);
        }

        function journeyLoop() {
            if (!isJourneyActive) return;
            if (isJumping) {
                playerVelocityY -= GRAVITY; player.style.bottom = `${parseFloat(player.style.bottom) + playerVelocityY}px`;
                if (parseFloat(player.style.bottom) <= 16) { player.style.bottom = '16%'; isJumping = false; player.classList.remove('jump'); }
            }
            document.querySelectorAll('.obstacle').forEach(obstacle => {
                obstacle.style.left = `${obstacle.offsetLeft - 5}px`;
                const pRect = player.getBoundingClientRect(), oRect = obstacle.getBoundingClientRect();
                if (pRect.right > oRect.left && pRect.left < oRect.right && pRect.bottom > oRect.top && pRect.top < oRect.bottom) {
                    obstacle.remove(); gameState.water = Math.max(0, gameState.water - 0.5); updateHUD();
                    if (gameState.water === 0 && !gameState.isGameOver) gameOver("You lost all your water during the journey.");
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
            if (shouldFilter) { gameState.water *= 0.75; gameState.isWaterClean = true; }
            else { gameState.isWaterClean = false; }
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
                const action = choice.id.replace('-btn', '');
                if (action === 'drink') dayChoices.drank = true;
                else dayChoices[action] = true;
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
                if (!gameState.isWaterClean && Math.random() < SICKNESS_CHANCE) { gameState.health -= 35; summary += "But the dirty water made you violently ill! "; }
                else { gameState.health = Math.min(100, gameState.health + 5); }
            } else { gameState.health -= 25; summary += "You went the whole day without drinking. Dehydration is setting in. "; }

            if (dayChoices.cooked) {
                if (gameState.cropHealth >= 20) { gameState.health = Math.min(100, gameState.health + 15); gameState.cropHealth -= 10; summary += "You cooked a decent meal. "; }
                else { gameState.health -= 10; summary += "You cooked, but had almost no food to prepare. "; }
            } else if (!dayChoices.drank) { gameState.health -= 15; summary += "With no water to cook, you went hungry. "; }

            if (dayChoices.wateredCrops) { gameState.cropHealth = Math.min(100, gameState.cropHealth + 25); summary += "The crops were watered. "; }
            else { gameState.cropHealth -= 20; summary += "The crops are dry and wilting. "; }
            
            if (dayChoices.washed) { summary += "You washed your hands, staving off other illnesses. "; }
            else { gameState.health -= 10; summary += "Poor hygiene adds to your health troubles. "; }

            gameState.cropHealth = Math.max(0, gameState.cropHealth);
            gameState.health = Math.max(0, gameState.health);
            summaryUI.day.textContent = gameState.day; summaryUI.text.textContent = summary;
            switchScreen('summary');
            updateHUD();
            if (gameState.health <= 0) gameOver("Your health reached zero.");
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
        gameContainer.addEventListener('click', handleJump);
        window.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleJump(); } });

        init();
    })();
});