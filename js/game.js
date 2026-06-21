let score = 0;
let timeLeft = 300;
let items = [];
let sortingAreaItems = [];
let gameActive = true;

const messyPile = document.getElementById('messy-pile');
const sortingArea = document.getElementById('sorting-area');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('game-over');
const finalStats = document.getElementById('final-stats');
const musicSelector = document.getElementById('music-selector');

// Sound Effects
const sounds = {
    grab: new Audio('sounds/grab.mp3'),
    thunk: new Audio('sounds/thunk.mp3'),
    sparkle: new Audio('sounds/sparkle.mp3'),
    error: new Audio('sounds/error.mp3')
};

let backgroundMusic = null;

function playSound(name) {
    if (sounds[name]) {
        const sound = sounds[name].cloneNode();
        sound.play().catch(e => console.log('Audio play blocked or failed:', e));
    }
}

// Item Generator
function getIconForItem(type) {
    return `<iconify-icon icon="${type.icon}" style="color: ${type.color}"></iconify-icon>`;
}

function playTrack(trackUrl) {
    if (!trackUrl) return;

    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    backgroundMusic = new Audio(trackUrl);
    backgroundMusic.loop = true;
    backgroundMusic.play().catch(err => {
        console.log('Music play blocked:', err);
        // If blocked, try to play on next interaction
        const startOnInteraction = () => {
            if (backgroundMusic) {
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

function initGame() {
    // Music Selection Logic
    if (musicSelector) {
        musicSelector.addEventListener('change', (e) => {
            playTrack(e.target.value);
        });

        // Randomly select and play a song on load
        const options = Array.from(musicSelector.options).filter(opt => !opt.disabled && opt.value);
        if (options.length > 0) {
            const randomOption = options[Math.floor(Math.random() * options.length)];
            musicSelector.value = randomOption.value;
            playTrack(randomOption.value);
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

    startTimer();
}

function createItemElement(type, pairId) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.typeId = type.id;
    div.dataset.pairId = pairId;
    div.innerHTML = getIconForItem(type);
    div.title = type.name;

    // Dragging logic
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    let initialRotation = 0;

    function handleStart(clientX, clientY) {
        if (!gameActive) return;
        
        // Check if this item is currently being ejected/animated
        if (div.classList.contains('ejecting')) return;

        isDragging = true;
        
        playSound('grab');

        // Remove from sorting area if it was there
        const index = sortingAreaItems.indexOf(div);
        if (index > -1) {
            sortingAreaItems.splice(index, 1);
        }

        // Capture initial state
        startX = clientX;
        startY = clientY;
        initialLeft = parseFloat(div.style.left) || 0;
        initialTop = parseFloat(div.style.top) || 0;
        
        // Extract rotation if it exists
        const transform = div.style.transform;
        const rotMatch = transform.match(/rotate\(([-\d.]+)deg\)/);
        initialRotation = rotMatch ? parseFloat(rotMatch[1]) : 0;
        
        div.style.transition = 'none';
        
        // Bring to front
        div.style.zIndex = 1000;
    }

    function handleMove(clientX, clientY) {
        if (!isDragging) return;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        div.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${initialRotation}deg)`;
    }

    function handleEnd(clientX, clientY) {
        if (!isDragging) return;
        isDragging = false;

        const dx = clientX - startX;
        const dy = clientY - startY;

        div.style.left = `${initialLeft + dx}px`;
        div.style.top = `${initialTop + dy}px`;
        div.style.transform = `rotate(${initialRotation}deg)`;

        div.style.transition = 'transform 0.2s ease, left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1), top 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)';

        checkDrop(div, clientX, clientY);
    }

    div.addEventListener('mousedown', (e) => {
        handleStart(e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', (e) => {
        handleEnd(e.clientX, e.clientY);
    });

    // Touch events
    div.addEventListener('touchstart', (e) => {
        if (div.classList.contains('ejecting')) return;
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
        // Prevent scrolling while dragging
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const touch = e.changedTouches[0];
        handleEnd(touch.clientX, touch.clientY);
    });

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
    const interval = setInterval(() => {
        if (!gameActive) {
            clearInterval(interval);
            return;
        }
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
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
