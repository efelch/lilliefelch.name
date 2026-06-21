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

// Item Generator
function getIconForItem(type) {
    return `<iconify-icon icon="${type.icon}" style="color: ${type.color}"></iconify-icon>`;
}

function initGame() {
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
        const x = centerX + Math.cos(angle) * (radius * 1.3) - (itemEl.offsetWidth / 2 || 30);
        const y = centerY + Math.sin(angle) * radius - (itemEl.offsetHeight / 2 || 30);
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
    let offsetX, offsetY;

    function handleStart(clientX, clientY) {
        if (!gameActive) return;
        isDragging = true;
        
        // Remove from sorting area if it was there
        const index = sortingAreaItems.indexOf(div);
        if (index > -1) {
            sortingAreaItems.splice(index, 1);
        }

        const rect = div.getBoundingClientRect();
        
        // Offset relative to the item's top-left corner
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        
        div.style.transition = 'none';
        
        // Bring to front
        div.style.zIndex = 1000;
    }

    function handleMove(clientX, clientY) {
        if (!isDragging) return;
        
        const parentRect = div.offsetParent.getBoundingClientRect();
        const x = clientX - parentRect.left - offsetX;
        const y = clientY - parentRect.top - offsetY;
        
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
    }

    function handleEnd(clientX, clientY) {
        if (!isDragging) return;
        isDragging = false;
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
            
            // Calculate position in sorting area
            const index = sortingAreaItems.indexOf(itemEl);
            const containerRect = gameContainer.getBoundingClientRect();
            const areaRect = sortingArea.getBoundingClientRect();
            
            // Positions relative to game-container
            const itemX = (areaRect.left - containerRect.left) + (areaRect.width / 3) * (index + 1) - (itemEl.offsetWidth / 2 || 30);
            const itemY = (areaRect.top - containerRect.top) + (areaRect.height / 2) - (itemEl.offsetHeight / 2 || 30);

            itemEl.style.left = `${itemX}px`;
            itemEl.style.top = `${itemY}px`;
            itemEl.style.transform = 'none';
            
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
    
    // Random position within the messy pile
    const containerRect = gameContainer.getBoundingClientRect();
    const pileRect = messyPile.getBoundingClientRect();
    const centerX = pileRect.left - containerRect.left + pileRect.width / 2;
    const centerY = pileRect.top - containerRect.top + pileRect.height / 2;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (pileRect.width < pileRect.height ? pileRect.width : pileRect.height) * 0.4;
    const targetX = centerX + Math.cos(angle) * (radius * 1.3) - (itemEl.offsetWidth / 2 || 30);
    const targetY = centerY + Math.sin(angle) * radius - (itemEl.offsetHeight / 2 || 30);
    const rotation = Math.random() * 360;
    
    // To create a "shoot off" effect, we can use a temporary higher speed or different easing
    itemEl.style.transition = 'left 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.1), top 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.1), transform 1.2s ease';
    
    itemEl.style.left = `${targetX}px`;
    itemEl.style.top = `${targetY}px`;
    itemEl.style.transform = `rotate(${rotation}deg)`;
    itemEl.style.zIndex = Math.floor(Math.random() * 100);
}

function checkMatches() {
    if (sortingAreaItems.length === 2) {
        const item1 = sortingAreaItems[0];
        const item2 = sortingAreaItems[1];

        if (item1.dataset.typeId === item2.dataset.typeId) {
            // Match!
            setTimeout(() => {
                item1.classList.add('matched-item');
                item2.classList.add('matched-item');
                
                shootConfetti();
                
                setTimeout(() => {
                    item1.remove();
                    item2.remove();
                    score += 10;
                    scoreDisplay.innerText = score;
                    sortingAreaItems = [];
                    
                    // Check if all sorted
                    if (document.querySelectorAll('.item').length === 0) {
                        endGame();
                    }
                }, 800);
            }, 300);
        } else {
            // Mismatch!
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
                const itemX = (areaRect.left - containerRect.left) + (areaRect.width / 3) * (index + 1) - (itemEl.offsetWidth / 2 || 30);
                const itemY = (areaRect.top - containerRect.top) + (areaRect.height / 2) - (itemEl.offsetHeight / 2 || 30);
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
}

function shootConfetti() {
    const colors = ['#f06292', '#ec407a', '#c2185b', '#fce4ec', '#ffd54f', '#4fc3f7'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random start position (bottom or sides)
        const containerWidth = gameContainer.offsetWidth;
        const containerHeight = gameContainer.offsetHeight;
        const startX = Math.random() * containerWidth;
        const startY = containerHeight + 10;
        
        confetti.style.left = `${startX}px`;
        confetti.style.top = `${startY}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        
        gameContainer.appendChild(confetti);
        
        // Animate
        const angle = (Math.random() * 60 + 60) * (Math.PI / 180); // 60-120 degrees
        const velocity = Math.random() * 32 + 32;
        const vx = Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1);
        const vy = -Math.sin(angle) * velocity;
        let x = startX;
        let y = startY;
        let gravity = 0.4;
        let opacity = 1;
        
        const animate = () => {
            x += vx;
            y += vy + gravity;
            gravity += 0.25;
            opacity -= 0.025;
            
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;
            confetti.style.opacity = opacity;
            confetti.style.transform = `rotate(${x}deg)`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

window.onload = initGame;
