document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const hud = {
        day: document.getElementById('day-stat'),
        health: document.getElementById('health-stat'),
        water: document.getElementById('water-stat'),
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
        drinkBtn: document.getElementById('drink-btn'),
        cropsBtn: document.getElementById('crops-btn'),
        hygieneBtn: document.getElementById('hygiene-btn'),
        finishDayBtn: document.getElementById('finish-day-btn'),
    };
    const summaryUI = {
        day: document.getElementById('summary-day'),
        title: document.getElementById('summary-title'),
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
    const PLAYER_JUMP_VELOCITY = 18;
    const GRAVITY = 0.8;
    const JOURNEY_DURATION = 15000;
    const OBSTACLE_INTERVAL = 2000;

    let journeyIntervals = [];
    let playerVelocityY = 0;
    let isJumping = false;
    let dayChoices = {};


    function init() {
        gameState = {
            day: 0,
            health: 100,
            water: 0,
            cropHealth: 50, // 0-100
            isGameOver: false,
        };
        dayChoices = {};
        switchScreen('start');
        updateHUD();
    }

    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    function startGame() {
        gameState.day++;
        switchScreen('journey');
        startJourney();
    }

    function startJourney() {
        // Reset journey state
        gameState.water = 5.0; // Start each journey with 5L
        isJumping = false;
        playerVelocityY = 0;
        player.style.bottom = '15%'; // Reset player position
        updateHUD();

        // Clear existing obstacles
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        
        // Start running animation
        const runAnim = setInterval(() => {
            if (player.style.backgroundImage.includes('stickman-running-1')) {
                player.style.backgroundImage = "url('img/stickman-running-2.png')";
            } else {
                player.style.backgroundImage = "url('img/stickman-running-1.png')";
            }
        }, 150);
        
        // Start spawning obstacles
        const obstacleSpawner = setInterval(createObstacle, OBSTACLE_INTERVAL);

        // End journey after a set time
        const journeyTimer = setTimeout(endJourney, JOURNEY_DURATION);

        journeyIntervals = [runAnim, obstacleSpawner, journeyTimer];
        
        // Start the game loop for physics and collision
        requestAnimationFrame(journeyLoop);
    }
    
    function journeyLoop() {
        if (gameState.isGameOver || !screens.journey.classList.contains('active')) return;

        // Player physics
        if (isJumping) {
            playerVelocityY -= GRAVITY;
            let currentBottom = parseFloat(player.style.bottom);
            player.style.bottom = `${currentBottom + playerVelocityY}px`;

            if (parseFloat(player.style.bottom) <= 15) {
                player.style.bottom = '15%';
                isJumping = false;
                player.classList.remove('jump');
            }
        }
        
        // Move obstacles and check for collision
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            obstacle.style.left = `${obstacle.offsetLeft - 5}px`;
            
            // Collision detection
            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            if (playerRect.right > obstacleRect.left && 
                playerRect.left < obstacleRect.right && 
                playerRect.bottom > obstacleRect.top && 
                playerRect.top < obstacleRect.bottom) {
                
                obstacle.remove(); // Remove obstacle on hit
                gameState.water -= 0.25;
                updateHUD();
                if (gameState.water <= 0) {
                    gameOver("You ran out of water during the journey.");
                }
            }

            // Remove obstacle when off-screen
            if (obstacle.offsetLeft < -50) {
                obstacle.remove();
            }
        });

        requestAnimationFrame(journeyLoop);
    }

    function endJourney() {
        // Stop all journey-related intervals
        journeyIntervals.forEach(clearInterval);
        switchScreen('allocation');
        setupAllocation();
    }

    function setupAllocation() {
        dayChoices = { drank: false, wateredCrops: false, washed: false };
        allocationUI.waterBudget.textContent = gameState.water.toFixed(2);
        allocationUI.cropStat.textContent = gameState.cropHealth;
        updateAllocationButtons();
    }

    function handleAllocation(choice) {
        const cost = parseFloat(choice.dataset.cost);
        if (gameState.water >= cost) {
            gameState.water -= cost;
            choice.disabled = true;

            if (choice.id === 'drink-btn') dayChoices.drank = true;
            if (choice.id === 'crops-btn') dayChoices.wateredCrops = true;
            if (choice.id === 'hygiene-btn') dayChoices.washed = true;
            
            updateHUD();
            allocationUI.waterBudget.textContent = gameState.water.toFixed(2);
            updateAllocationButtons();
        }
    }

    function updateAllocationButtons() {
        [allocationUI.drinkBtn, allocationUI.cropsBtn, allocationUI.hygieneBtn].forEach(btn => {
            if (!btn.disabled) { // only check buttons that haven't been clicked
                btn.disabled = gameState.water < parseFloat(btn.dataset.cost);
            }
        });
    }
    
    function finishDay() {
        let summary = "";
        
        // Health consequences
        if (dayChoices.drank) {
            gameState.health = Math.min(100, gameState.health + 10);
            summary += "You quenched your thirst, restoring some health. ";
        } else {
            gameState.health -= 20;
            summary += "Dehydration saps your strength. Your health suffers. ";
        }

        // Crop & Food consequences
        if (dayChoices.wateredCrops) {
            gameState.cropHealth = Math.min(100, gameState.cropHealth + 30);
            summary += "Your crops look healthier. ";
        } else {
            gameState.cropHealth -= 20;
            summary += "The crops are wilting from lack of water. ";
        }
        
        if (gameState.cropHealth > 40) { 
            gameState.health = Math.min(100, gameState.health + 5);
             summary += "You were able to eat a meal. ";
        } else {
            gameState.health -= 15;
            summary += "There wasn't enough food to eat today. ";
        }
        
        // Hygiene consequences
        if (dayChoices.washed) {
            summary += "Good hygiene keeps sickness away. ";
        } else {
            gameState.health -= 10;
            summary += "Poor hygiene leaves you vulnerable to illness. ";
        }

        gameState.cropHealth = Math.max(0, gameState.cropHealth);
        gameState.health = Math.max(0, gameState.health);

        // Rare random events (10% chance)
        const eventRoll = Math.random();
        if(eventRoll < 0.05) { // 5% chance of rain
            gameState.cropHealth = 100;
            gameState.water += 3.0;
            summary += "A rare downpour blessed your crops and filled your water stores! ";
        } else if (eventRoll < 0.1) { // 5% chance of disaster
            gameState.cropHealth = Math.floor(gameState.cropHealth / 2);
            summary += "A fierce dust storm damaged half of your crops! ";
        }

        // Show summary
        summaryUI.day.textContent = gameState.day;
        summaryUI.text.textContent = summary;
        switchScreen('summary');
        updateHUD();

        // Check for Game Over
        if (gameState.health <= 0) {
            gameOver("Your health reached zero.");
        }
    }

    function gameOver(reason) {
        gameState.isGameOver = true;
        journeyIntervals.forEach(clearInterval); // Stop everything just in case
        gameOverUI.reason.textContent = reason;
        gameOverUI.finalDays.textContent = gameState.day;
        switchScreen('gameOver');
    }

    // --- HELPER FUNCTIONS ---

    function updateHUD() {
        hud.day.textContent = gameState.day;
        hud.health.textContent = gameState.health;
        hud.water.textContent = gameState.water.toFixed(2);
    }
    
    function createObstacle() {
        if (!screens.journey.classList.contains('active')) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.left = `${gameContainer.offsetWidth}px`;
        // Randomize rock image
        const rockNum = Math.floor(Math.random() * 4) + 1;
        obstacle.style.backgroundImage = `url('img/rock-${rockNum}.png')`;
        screens.journey.appendChild(obstacle);
    }
    
    function handleJump() {
        if (!isJumping) {
            isJumping = true;
            player.classList.add('jump');
            playerVelocityY = PLAYER_JUMP_VELOCITY;
        }
    }

    // --- EVENT LISTENERS ---
    buttons.start.addEventListener('click', startGame);
    buttons.nextDay.addEventListener('click', startGame);
    buttons.playAgain.addEventListener('click', init);

    allocationUI.drinkBtn.addEventListener('click', () => handleAllocation(allocationUI.drinkBtn));
    allocationUI.cropsBtn.addEventListener('click', () => handleAllocation(allocationUI.cropsBtn));
    allocationUI.hygieneBtn.addEventListener('click', () => handleAllocation(allocationUI.hygieneBtn));
    allocationUI.finishDayBtn.addEventListener('click', finishDay);

    // Player jump controls
    gameContainer.addEventListener('click', handleJump);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleJump();
        }
    });

    // --- INITIALIZE GAME ---
    init();
});