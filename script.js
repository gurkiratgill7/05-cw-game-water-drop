document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const gameContainer = document.getElementById('game-container');
    const hud = {
        day: document.getElementById('day-stat'),
        health: document.getElementById('health-stat'),
        dirtyWater: document.getElementById('dirty-water-stat'),
        cleanWater: document.getElementById('clean-water-stat'),
    };
    const screens = {
        start: document.getElementById('start-screen'),
        journey: document.getElementById('journey-screen'),
        allocation: document.getElementById('allocation-screen'),
        summary: document.getElementById('summary-screen'),
        gameOver: document.getElementById('game-over-screen'),
    };
    const player = document.getElementById('player');
    const allocationUI = {
        waterBudget: document.getElementById('water-budget'),
        cropStat: document.getElementById('crop-stat'),
        filterBtn: document.getElementById('filter-btn'),
        drinkCleanBtn: document.getElementById('drink-clean-btn'),
        drinkDirtyBtn: document.getElementById('drink-dirty-btn'),
        cookBtn: document.getElementById('cook-btn'),
        cropsBtn: document.getElementById('crops-btn'),
        hygieneBtn: document.getElementById('hygiene-btn'),
        finishDayBtn: document.getElementById('finish-day-btn'),
    };
    const summaryUI = {
        day: document.getElementById('summary-day'),
        text: document.getElementById('summary-text'),
    };
    const gameOverUI = {
        reason: document.getElementById('game-over-reason'),
        finalDays: document.getElementById('final-days'),
    };
    const buttons = {
        start: document.getElementById('start-game-btn'),
        nextDay: document.getElementById('next-day-btn'),
        playAgain: document.getElementById('play-again-btn'),
    };

    // --- GAME STATE & CONSTANTS ---
    let gameState = {};
    const PLAYER_JUMP_VELOCITY = 22;
    const GRAVITY = 0.9;
    const JOURNEY_DURATION = 25000;
    const OBSTACLE_INTERVAL = 1800;
    const SICKNESS_CHANCE = 0.6;

    let journeyIntervals = [];
    let playerVelocityY = 0;
    let isJumping = false;
    let dayChoices = {};

    function init() {
        gameState = {
            day: 0, health: 100, dirtyWater: 0, cleanWater: 0,
            cropHealth: 50, isGameOver: false,
        };
        switchScreen('start');
        updateHUD();
    }

    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    }

    function startGame() {
        if (gameState.isGameOver) return;
        gameState.day++;
        switchScreen('journey');
        startJourney();
    }

    function startJourney() {
        const initialWater = 5.0;
        gameState.dirtyWater += initialWater;
        isJumping = false; playerVelocityY = 0; player.style.bottom = '16%';
        updateHUD();
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        
        const runAnim = setInterval(() => {
            player.style.backgroundImage = player.style.backgroundImage.includes('1')
                ? "url('img/stickman-running-2.png')"
                : "url('img/stickman-running-1.png')";
        }, 150);
        
        const obstacleSpawner = setInterval(createObstacle, OBSTACLE_INTERVAL);
        const journeyTimer = setTimeout(endJourney, JOURNEY_DURATION);
        journeyIntervals = [runAnim, obstacleSpawner, journeyTimer];
        
        requestAnimationFrame(journeyLoop);
    }
    
    function journeyLoop() {
        if (gameState.isGameOver || !screens.journey.classList.contains('active')) {
            journeyIntervals.forEach(clearInterval);
            return;
        }
        if (isJumping) {
            playerVelocityY -= GRAVITY;
            player.style.bottom = `${parseFloat(player.style.bottom) + playerVelocityY}px`;
            if (parseFloat(player.style.bottom) <= 16) {
                player.style.bottom = '16%';
                isJumping = false;
                player.classList.remove('jump');
            }
        }
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.style.left = `${obstacle.offsetLeft - 5}px`;
            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            if (playerRect.right > obstacleRect.left && playerRect.left < obstacleRect.right && playerRect.bottom > obstacleRect.top && playerRect.top < obstacleRect.bottom) {
                obstacle.remove();
                gameState.dirtyWater = Math.max(0, gameState.dirtyWater - 0.5);
                updateHUD();
                if (gameState.dirtyWater === 0) gameOver("You lost all your water during the journey.");
            }
            if (obstacle.offsetLeft < -50) obstacle.remove();
        });
        requestAnimationFrame(journeyLoop);
    }

    function endJourney() {
        journeyIntervals.forEach(clearInterval);
        switchScreen('allocation');
        setupAllocation();
    }

    function setupAllocation() {
        dayChoices = { drank: false, cooked: false, wateredCrops: false, washed: false, gotSick: false };
        Object.values(allocationUI).forEach(btn => {
            if (btn.tagName === 'BUTTON') btn.disabled = false;
        });
        allocationUI.waterBudget.textContent = gameState.dirtyWater.toFixed(1);
        allocationUI.cropStat.textContent = Math.round(gameState.cropHealth);
        updateAllocationButtons();
    }

    function handleAllocation(choice) {
        const action = choice.id.replace('-btn', '');
        const cost = parseFloat(choice.dataset.cost);

        switch (action) {
            case 'filter': if (gameState.dirtyWater >= cost) { gameState.dirtyWater -= cost; gameState.cleanWater += 1.0; } break;
            case 'drink-clean': if (gameState.cleanWater >= cost) { gameState.cleanWater -= cost; dayChoices.drank = true; } break;
            case 'drink-dirty': if (gameState.dirtyWater >= cost) { gameState.dirtyWater -= cost; dayChoices.drank = true; if (Math.random() < SICKNESS_CHANCE) dayChoices.gotSick = true; } break;
            case 'cook': if (gameState.dirtyWater >= cost) { gameState.dirtyWater -= cost; dayChoices.cooked = true; } break;
            case 'crops': if (gameState.dirtyWater >= cost) { gameState.dirtyWater -= cost; dayChoices.wateredCrops = true; } break;
            case 'hygiene': if (gameState.dirtyWater >= cost) { gameState.dirtyWater -= cost; dayChoices.washed = true; } break;
        }
        updateHUD();
        updateAllocationButtons();
    }

    function updateAllocationButtons() {
        allocationUI.filterBtn.disabled = gameState.dirtyWater < 2.0;
        allocationUI.drinkCleanBtn.disabled = gameState.cleanWater < 1.0 || dayChoices.drank;
        allocationUI.drinkDirtyBtn.disabled = gameState.dirtyWater < 1.0 || dayChoices.drank;
        allocationUI.cookBtn.disabled = gameState.dirtyWater < 1.5 || dayChoices.cooked;
        allocationUI.cropsBtn.disabled = gameState.dirtyWater < 1.0 || dayChoices.wateredCrops;
        allocationUI.hygieneBtn.disabled = gameState.dirtyWater < 1.0 || dayChoices.washed;
    }
    
    function finishDay() {
        let summary = "";
        
        if (dayChoices.drank) {
            summary += "You managed to drink today. ";
            if (dayChoices.gotSick) { gameState.health -= 35; summary += "But the dirty water made you violently ill! "; }
            else { gameState.health = Math.min(100, gameState.health + 5); }
        } else { gameState.health -= 25; summary += "You went the whole day without drinking. Dehydration is setting in. "; }

        if (dayChoices.cooked) {
            if (gameState.cropHealth >= 20) {
                gameState.health = Math.min(100, gameState.health + 15);
                gameState.cropHealth -= 10;
                summary += "You cooked a decent meal. ";
            } else { gameState.health -= 10; summary += "You cooked, but had almost no food to prepare. "; }
        } else { gameState.health -= 15; summary += "With no water to cook, you went hungry. "; }
        
        if (dayChoices.wateredCrops) { gameState.cropHealth = Math.min(100, gameState.cropHealth + 25); summary += "The crops were watered. "; }
        else { gameState.cropHealth -= 20; summary += "The crops are dry and wilting. "; }
        
        if (dayChoices.washed) { summary += "You washed your hands, staving off other illnesses. "; }
        else { gameState.health -= 10; summary += "Poor hygiene adds to your health troubles. "; }

        gameState.cropHealth = Math.max(0, gameState.cropHealth);
        gameState.health = Math.max(0, gameState.health);
        summaryUI.day.textContent = gameState.day;
        summaryUI.text.textContent = summary;
        switchScreen('summary');
        updateHUD();
        if (gameState.health <= 0) gameOver("Your health reached zero.");
    }

    function gameOver(reason) {
        gameState.isGameOver = true;
        journeyIntervals.forEach(clearInterval);
        gameOverUI.reason.textContent = reason;
        gameOverUI.finalDays.textContent = gameState.day;
        switchScreen('gameOver');
    }

    function updateHUD() {
        hud.day.textContent = gameState.day;
        hud.health.textContent = Math.round(gameState.health);
        hud.dirtyWater.textContent = gameState.dirtyWater.toFixed(1);
        hud.cleanWater.textContent = gameState.cleanWater.toFixed(1);
    }
    
    function createObstacle() {
        if (!screens.journey.classList.contains('active')) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.left = `${gameContainer.offsetWidth}px`;
        obstacle.style.backgroundImage = `url('img/rock-${Math.floor(Math.random() * 4) + 1}.png')`;
        screens.journey.appendChild(obstacle);
    }
    
    function handleJump() {
        if (!isJumping && screens.journey.classList.contains('active')) {
            isJumping = true;
            player.classList.add('jump');
            playerVelocityY = PLAYER_JUMP_VELOCITY;
        }
    }

    // --- EVENT LISTENERS ---
    buttons.start.addEventListener('click', startGame);
    buttons.nextDay.addEventListener('click', startGame);
    buttons.playAgain.addEventListener('click', init);
    allocationUI.finishDayBtn.addEventListener('click', finishDay);
    Object.values(allocationUI).forEach(btn => {
        if (btn.tagName === 'BUTTON' && btn.id !== 'finish-day-btn') {
            btn.addEventListener('click', () => handleAllocation(btn));
        }
    });
    gameContainer.addEventListener('click', handleJump);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleJump();
        }
    });

    init();
});