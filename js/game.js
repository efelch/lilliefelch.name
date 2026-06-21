let score = 0;
let timeLeft = 300;
let items = [];
let sortingAreaItems = [];
let gameActive = true;
let isPaused = false;
let timerInterval = null;

const messyPile = document.getElementById('messy-pile');
const sortingArea = document.getElementById('sorting-area');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('game-over');
const loadingScreen = document.getElementById('loading-screen');
const startButton = document.getElementById('start-button');
const finalStats = document.getElementById('final-stats');
const musicSelector = document.getElementById('music-selector');
const pauseButton = document.getElementById('pause-button');
const resumeButton = document.getElementById('resume-button');
const newGameButton = document.getElementById('new-game-button');
const pauseScreen = document.getElementById('pause-screen');

// Sound Effects
const sounds = {
    grab: new Audio('sounds/grab.mp3'),
    thunk: new Audio('sounds/thunk.mp3'),
    sparkle: new Audio('sounds/sparkle.mp3'),
    error: new Audio('sounds/error.mp3')
};

let backgroundMusic = null;
let slideshowInterval = null;

function startLoadingSlideshow() {
    const slideshowIcon = document.getElementById('slideshow-icon');
    if (!slideshowIcon) return;

    let currentIndex = 0;
    const itemsToShow = [...ITEM_TYPES];
    // Shuffle items for the slideshow
    for (let i = itemsToShow.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsToShow[i], itemsToShow[j]] = [itemsToShow[j], itemsToShow[i]];
    }

    function updateIcon() {
        const item = itemsToShow[currentIndex];
        slideshowIcon.classList.add('fade-out');
        
        setTimeout(() => {
            slideshowIcon.innerHTML = `<iconify-icon icon="${item.icon}" style="color: ${item.color}"></iconify-icon>`;
            slideshowIcon.classList.remove('fade-out');
            slideshowIcon.classList.add('fade-in');
            
            currentIndex = (currentIndex + 1) % itemsToShow.length;
        }, 500);
    }

    updateIcon();
    slideshowInterval = setInterval(updateIcon, 2500);
}

function stopLoadingSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

// Persistence Logic
function saveGameState() {
    if (!gameActive) return;
    const itemsData = Array.from(document.querySelectorAll('.item')).map(el => ({
        id: el.id,
        typeId: el.dataset.typeId,
        pairId: el.dataset.pairId,
        left: el.style.left,
        top: el.style.top,
        transform: el.style.transform,
        zIndex: el.style.zIndex,
        inSortingArea: sortingAreaItems.includes(el)
    }));

    const gameState = {
        score,
        timeLeft,
        items: itemsData,
        music: musicSelector.value
    };
    localStorage.setItem('royal_sorter_save', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('royal_sorter_save');
    if (!saved) return false;

    try {
        const gameState = JSON.parse(saved);
        score = gameState.score;
        timeLeft = gameState.timeLeft;
        scoreDisplay.innerText = score;
        timerDisplay.innerText = timeLeft;
        
        if (gameState.music) {
            musicSelector.value = gameState.music;
            playTrack(gameState.music, true);
        }

        // Clear existing items
        document.querySelectorAll('.item').forEach(el => el.remove());
        items = [];
        sortingAreaItems = [];

        gameState.items.forEach(itemData => {
            const type = ITEM_TYPES.find(t => t.id == itemData.typeId);
            if (type) {
                const itemEl = createItemElement(type, itemData.pairId, itemData.id);
                itemEl.style.left = itemData.left;
                itemEl.style.top = itemData.top;
                itemEl.style.transform = itemData.transform;
                itemEl.style.zIndex = itemData.zIndex;
                
                gameContainer.appendChild(itemEl);
                items.push(itemEl);
                
                if (itemData.inSortingArea) {
                    sortingAreaItems.push(itemEl);
                    itemEl.classList.add('in-sorting-area');
                }
            }
        });

        return true;
    } catch (e) {
        console.error("Failed to load game state:", e);
        return false;
    }
}

function clearGameState() {
    localStorage.removeItem('royal_sorter_save');
}

function playSound(name) {
    if (sounds[name]) {
        const sound = sounds[name].cloneNode();
        sound.play().catch(e => console.log('Audio play blocked or failed:', e));
    }
}

// Item Generator
function getIconForItem(type) {
    return `<iconify-icon icon="${type.icon}" style="color: ${type.color}" aria-label="${type.name}"></iconify-icon>`;
}

function playTrack(trackUrl, isInitialLoad = false) {
    if (!trackUrl) return;

    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    backgroundMusic = new Audio(trackUrl);
    backgroundMusic.loop = true;

    if (isInitialLoad) {
        startLoadingSlideshow();

        let musicReady = false;
        let gameStarted = false;

        const onMusicReady = () => {
            musicReady = true;
            const loader = document.querySelector('.loader');
            const slideshowContainer = document.querySelector('.slideshow-container');
            const loadingText = loadingScreen.querySelector('p');
            
            if (loader) loader.classList.add('hidden');
            if (slideshowContainer) slideshowContainer.classList.add('hidden');
            stopLoadingSlideshow();
            if (loadingText) loadingText.innerText = 'Royal Music Ready!';
            
            showStartButton();

            if (gameStarted && !isPaused) {
                backgroundMusic.play().catch(err => console.log('Music play delayed:', err));
            }
        };

        const showStartButton = () => {
            if (startButton && startButton.classList.contains('hidden')) {
                startButton.classList.remove('hidden');
                startButton.onclick = () => {
                    gameStarted = true;
                    loadingScreen.classList.add('hidden');
                    if (musicReady && !isPaused) {
                        backgroundMusic.play().catch(err => console.log('Music play blocked:', err));
                    }
                    startTimer();
                };
            }
        };

        backgroundMusic.addEventListener('canplaythrough', onMusicReady, { once: true });
        
        // Show start button after 3 seconds regardless of music state
        setTimeout(showStartButton, 3000);
    }

    if (!isPaused && !isInitialLoad) {
        backgroundMusic.play().catch(err => {
            console.log('Music play blocked:', err);
            // If blocked, try to play on next interaction
            const startOnInteraction = () => {
                if (backgroundMusic && !isPaused) {
                    backgroundMusic.play().catch(e => console.log('Still blocked:', e));
                }
                document.removeEventListener('click', startOnInteraction);
                document.removeEventListener('keydown', startOnInteraction);
                document.removeEventListener('touchstart', startOnInteraction);
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('keydown', startOnInteraction);
            document.addEventListener('touchstart', startOnInteraction);
        });
    }
}

let draggedItem = null;
let startX, startY;
let initialLeft, initialTop;
let initialRotation = 0;

function handleGlobalMove(e) {
    if (!draggedItem) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    draggedItem.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${initialRotation}deg)`;
    
    if (e.type.startsWith('touch') && e.cancelable) {
        e.preventDefault();
    }
}

function handleGlobalEnd(e) {
    if (!draggedItem) return;
    
    const clientX = e.type.startsWith('touch') ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.changedTouches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    const div = draggedItem;
    draggedItem = null;

    div.style.left = `${initialLeft + dx}px`;
    div.style.top = `${initialTop + dy}px`;
    div.style.transform = `rotate(${initialRotation}deg)`;
    div.style.transition = 'transform 0.2s ease, left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1), top 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)';

    checkDrop(div, clientX, clientY);
    saveGameState();
}

document.addEventListener('mousemove', handleGlobalMove);
document.addEventListener('mouseup', handleGlobalEnd);
document.addEventListener('touchmove', handleGlobalMove, { passive: false });
document.addEventListener('touchend', handleGlobalEnd);

function initGame() {
    // Music Selection Logic
    if (musicSelector) {
        musicSelector.addEventListener('change', (e) => {
            playTrack(e.target.value);
            saveGameState();
        });
    }

    if (pauseButton) {
        pauseButton.onclick = togglePause;
    }

    if (resumeButton) {
        resumeButton.onclick = togglePause;
    }

    if (newGameButton) {
        newGameButton.onclick = () => {
            clearGameState();
            location.reload();
        };
    }

    if (loadGameState()) {
        return;
    }

    if (musicSelector) {
        // Randomly select and play a song on load
        const options = Array.from(musicSelector.options).filter(opt => !opt.disabled && opt.value);
        if (options.length > 0) {
            const randomOption = options[Math.floor(Math.random() * options.length)];
            musicSelector.value = randomOption.value;
            playTrack(randomOption.value, true);
        }
    }

    // Create pairs for each item type
    ITEM_TYPES.forEach(type => {
        items.push(createItemElement(type, 1));
        items.push(createItemElement(type, 2));
    });

    // Shuffle and place in messy pile
    const containerRect = gameContainer.getBoundingClientRect();
    const pileRect = messyPile.getBoundingClientRect();
    const centerX = pileRect.left - containerRect.left + pileRect.width / 2;
    const centerY = pileRect.top - containerRect.top + pileRect.height / 2;

    items.forEach(itemEl => {
        // Random position within the circular messy pile
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (pileRect.width < pileRect.height ? pileRect.width : pileRect.height) * 0.4; 
        const itemWidth = itemEl.offsetWidth || (window.innerWidth <= 600 ? 40 : 60);
        const itemHeight = itemEl.offsetHeight || (window.innerWidth <= 600 ? 40 : 60);
        const x = centerX + Math.cos(angle) * (radius * 1.3) - (itemWidth / 2);
        const y = centerY + Math.sin(angle) * radius - (itemHeight / 2);
        const rotation = Math.random() * 360;
        
        itemEl.style.left = `${x}px`;
        itemEl.style.top = `${y}px`;
        itemEl.style.transform = `rotate(${rotation}deg)`;
        itemEl.style.zIndex = Math.floor(Math.random() * 100);
        
        gameContainer.appendChild(itemEl);
    });
}

function createItemElement(type, pairId, existingId = null) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.typeId = type.id;
    div.dataset.pairId = pairId;
    div.id = existingId || `item-${type.id}-${pairId}`;
    div.innerHTML = getIconForItem(type);
    div.title = type.name;

    function handleStart(clientX, clientY) {
        if (!gameActive || isPaused) return;
        if (div.classList.contains('ejecting')) return;

        draggedItem = div;
        playSound('grab');

        const index = sortingAreaItems.indexOf(div);
        if (index > -1) {
            sortingAreaItems.splice(index, 1);
        }

        startX = clientX;
        startY = clientY;
        initialLeft = parseFloat(div.style.left) || 0;
        initialTop = parseFloat(div.style.top) || 0;
        
        const transform = div.style.transform;
        const rotMatch = transform.match(/rotate\(([-\d.]+)deg\)/);
        initialRotation = rotMatch ? parseFloat(rotMatch[1]) : 0;
        
        div.style.transition = 'none';
        div.style.zIndex = 1000;
    }

    div.addEventListener('mousedown', (e) => {
        handleStart(e.clientX, e.clientY);
    });

    div.addEventListener('touchstart', (e) => {
        if (div.classList.contains('ejecting')) return;
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    return div;
}

function checkDrop(itemEl, x, y) {
    const sortingRect = sortingArea.getBoundingClientRect();
    const pileRect = messyPile.getBoundingClientRect();
    
    const isInSortingArea = (
        x >= sortingRect.left &&
        x <= sortingRect.right &&
        y >= sortingRect.top &&
        y <= sortingRect.bottom
    );

    const isInMessyPile = (
        x >= pileRect.left &&
        x <= pileRect.right &&
        y >= pileRect.top &&
        y <= pileRect.bottom
    );

    if (isInSortingArea) {
        // Only allow up to 2 items in sorting area
        if (sortingAreaItems.length < 2) {
            sortingAreaItems.push(itemEl);
            
            itemEl.classList.add('in-sorting-area');
            
            // Calculate position in sorting area
            const index = sortingAreaItems.indexOf(itemEl);
            const containerRect = gameContainer.getBoundingClientRect();
            const areaRect = sortingArea.getBoundingClientRect();
            
            // Positions relative to game-container
            const itemWidth = itemEl.offsetWidth || (window.innerWidth <= 600 ? 40 : 60);
            const itemHeight = itemEl.offsetHeight || (window.innerWidth <= 600 ? 40 : 60);
            const itemX = (areaRect.left - containerRect.left) + (areaRect.width / 3) * (index + 1) - (itemWidth / 2);
            const itemY = (areaRect.top - containerRect.top) + (areaRect.height / 2) - (itemHeight / 2);

            itemEl.style.left = `${itemX}px`;
            itemEl.style.top = `${itemY}px`;
            itemEl.style.transform = 'none';
            
            playSound('thunk');

            checkMatches();
        } else {
            // Sorting area full, eject back to pile
            moveToMessyPile(itemEl);
        }
    } else if (isInMessyPile) {
        // Dropped in the messy pile, let it stay where it was dropped
        // We just need to make sure it's not in sortingAreaItems anymore
        const index = sortingAreaItems.indexOf(itemEl);
        if (index > -1) {
            sortingAreaItems.splice(index, 1);
        }
        itemEl.classList.remove('in-sorting-area');
        // Random rotation for flavor
        const rotation = Math.random() * 360;
        itemEl.style.transform = `rotate(${rotation}deg)`;
    } else {
        // Dropped outside everything, move to messy pile center area
        moveToMessyPile(itemEl);
    }
}

function moveToMessyPile(itemEl) {
    // Ensure it's removed from sorting area if it was there
    const index = sortingAreaItems.indexOf(itemEl);
    if (index > -1) {
        sortingAreaItems.splice(index, 1);
    }
    itemEl.classList.remove('in-sorting-area');
    
    // Add temporary class to prevent immediate re-drag during animation
    itemEl.classList.add('ejecting');
    
    // Random position within the messy pile
    const containerRect = gameContainer.getBoundingClientRect();
    const pileRect = messyPile.getBoundingClientRect();
    const centerX = pileRect.left - containerRect.left + pileRect.width / 2;
    const centerY = pileRect.top - containerRect.top + pileRect.height / 2;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (pileRect.width < pileRect.height ? pileRect.width : pileRect.height) * 0.4;
    const itemWidth = itemEl.offsetWidth || (window.innerWidth <= 600 ? 40 : 60);
    const itemHeight = itemEl.offsetHeight || (window.innerWidth <= 600 ? 40 : 60);
    const targetX = centerX + Math.cos(angle) * (radius * 1.3) - (itemWidth / 2);
    const targetY = centerY + Math.sin(angle) * radius - (itemHeight / 2);
    const rotation = Math.random() * 360;
    
    // To create a "shoot off" effect, we can use a temporary higher speed or different easing
    itemEl.style.transition = 'left 0.8s cubic-bezier(0.15, 0.85, 0.35, 1.1), top 0.8s cubic-bezier(0.15, 0.85, 0.35, 1.1), transform 0.8s ease';
    
    itemEl.style.left = `${targetX}px`;
    itemEl.style.top = `${targetY}px`;
    itemEl.style.transform = `rotate(${rotation}deg)`;
    itemEl.style.zIndex = Math.floor(Math.random() * 100);

    setTimeout(() => {
        itemEl.classList.remove('ejecting');
    }, 800);
}

function checkMatches() {
    if (sortingAreaItems.length === 2) {
        const item1 = sortingAreaItems[0];
        const item2 = sortingAreaItems[1];

        if (item1.dataset.typeId === item2.dataset.typeId) {
            // Match!
            const matchedItems = [...sortingAreaItems];
            sortingAreaItems = []; // Clear immediately to allow new items

            setTimeout(() => {
                matchedItems.forEach(item => item.classList.add('matched-item'));
                
                playSound('sparkle');
                shootConfetti();
                
                setTimeout(() => {
                    matchedItems.forEach(item => item.remove());
                    score += 10;
                    scoreDisplay.innerText = score;
                    saveGameState();
                
                    // Check if all sorted
                    if (document.querySelectorAll('.item').length === 0) {
                        endGame();
                    }
                }, 800);
            }, 300);
        } else {
            // Mismatch!
            playSound('error');
            setTimeout(() => {
                const itemsToEject = [...sortingAreaItems];
                sortingAreaItems = [];
                itemsToEject.forEach(item => moveToMessyPile(item));
            }, 500);
        }
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameActive || isPaused) return;
        
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft % 5 === 0) saveGameState(); // Save every 5 seconds
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function togglePause() {
    if (!gameActive) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
        if (backgroundMusic) backgroundMusic.pause();
        pauseButton.innerHTML = '<iconify-icon icon="mdi:play"></iconify-icon>';
    } else {
        pauseScreen.classList.add('hidden');
        if (backgroundMusic) backgroundMusic.play().catch(err => console.log('Music resume blocked:', err));
        pauseButton.innerHTML = '<iconify-icon icon="mdi:pause"></iconify-icon>';
    }
}

// Handle window resize to keep items within bounds
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!gameActive) return;
        
        const containerRect = gameContainer.getBoundingClientRect();
        const pileRect = messyPile.getBoundingClientRect();
        const centerX = pileRect.left - containerRect.left + pileRect.width / 2;
        const centerY = pileRect.top - containerRect.top + pileRect.height / 2;
        
        document.querySelectorAll('.item').forEach(itemEl => {
            // Only reposition items that are NOT in the sorting area
            if (sortingAreaItems.indexOf(itemEl) === -1) {
                // Keep them within the new pile bounds
                const currentLeft = parseFloat(itemEl.style.left);
                const currentTop = parseFloat(itemEl.style.top);
                
                // If item is too far from new center, move it closer
                const dist = Math.sqrt(Math.pow(currentLeft - centerX, 2) + Math.pow(currentTop - centerY, 2));
                const maxRadius = (pileRect.width < pileRect.height ? pileRect.width : pileRect.height) * 0.6;
                
                if (dist > maxRadius) {
                    moveToMessyPile(itemEl);
                }
            } else {
                // Reposition item in sorting area
                const index = sortingAreaItems.indexOf(itemEl);
                const areaRect = sortingArea.getBoundingClientRect();
                const itemWidth = itemEl.offsetWidth || (window.innerWidth <= 600 ? 40 : 60);
                const itemHeight = itemEl.offsetHeight || (window.innerWidth <= 600 ? 40 : 60);
                const itemX = (areaRect.left - containerRect.left) + (areaRect.width / 3) * (index + 1) - (itemWidth / 2);
                const itemY = (areaRect.top - containerRect.top) + (areaRect.height / 2) - (itemHeight / 2);
                itemEl.style.left = `${itemX}px`;
                itemEl.style.top = `${itemY}px`;
            }
        });
    }, 200);
});

function endGame() {
    gameActive = false;
    isPaused = false;
    if (timerInterval) clearInterval(timerInterval);
    clearGameState();
    const remainingItems = document.querySelectorAll('.item').length;
    const penalty = remainingItems;
    const finalScore = score - penalty;
    
    finalStats.innerHTML = `
        Items Matched: ${score / 10}<br>
        Unsorted Items: ${remainingItems}<br>
        Penalty: -${penalty}<br>
        <strong>Final Score: ${finalScore}</strong>
    `;
    
    gameOverScreen.classList.remove('hidden');
    pauseScreen.classList.add('hidden');

    if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

function shootConfetti() {
    const colors = ['#f06292', '#ec407a', '#c2185b', '#fce4ec', '#ffd54f', '#4fc3f7'];
    const emojis = ['✨', '⭐', '💖', '👑', '💎', '🌸'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const isEmoji = Math.random() > 0.7;
        if (isEmoji) {
            confetti.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.fontSize = '20px';
            confetti.style.background = 'none';
        } else {
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        }
        
        // Random start position (bottom or sides)
        const containerWidth = gameContainer.offsetWidth;
        const containerHeight = gameContainer.offsetHeight;
        const startX = Math.random() * containerWidth;
        const startY = containerHeight + 10;
        
        confetti.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
        
        gameContainer.appendChild(confetti);
        
        // Animate
        const angle = (Math.random() * 60 + 60) * (Math.PI / 180); // 60-120 degrees
        const velocity = Math.random() * 12 + 10;
        const vx = Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1);
        const vy = -Math.sin(angle) * velocity;
        let curX = startX;
        let curY = startY;
        let gravity = 0.2;
        let opacity = 1;
        let rotation = 0;
        
        const animate = () => {
            curX += vx;
            curY += vy + gravity;
            gravity += 0.1;
            opacity -= 0.015;
            rotation += vx;
            
            confetti.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(${rotation}deg)`;
            confetti.style.opacity = opacity;
            
            if (opacity > 0 && curY < containerHeight + 100) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

window.onload = initGame;
