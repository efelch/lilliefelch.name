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

// SVG Generator
function getSVGForItem(type) {
    const color = type.color;
    // Simple shapes based on type id prefix
    let content = '';
    if (type.id.startsWith('brush')) {
        content = `<rect x="25" y="40" width="10" height="15" fill="#8B4513" /><rect x="15" y="10" width="30" height="35" rx="10" fill="${color}" /><line x1="20" y1="15" x2="20" y2="40" stroke="white" stroke-width="1" stroke-dasharray="2,2" />`;
    } else if (type.id.startsWith('toy')) {
        content = `<circle cx="30" cy="35" r="18" fill="${color}" /><circle cx="30" cy="20" r="12" fill="${color}" /><circle cx="20" cy="12" r="6" fill="${color}" /><circle cx="40" cy="12" r="6" fill="${color}" /><circle cx="26" cy="18" r="1.5" fill="black" /><circle cx="34" cy="18" r="1.5" fill="black" />`;
    } else if (type.id.startsWith('perfume')) {
        content = `<rect x="18" y="25" width="24" height="30" rx="5" fill="${color}" opacity="0.8" /><rect x="25" y="10" width="10" height="15" fill="#DAA520" /><circle cx="30" cy="10" r="4" fill="#DAA520" />`;
    } else if (type.id.startsWith('jewel')) {
        content = `<circle cx="30" cy="30" r="18" fill="none" stroke="#DAA520" stroke-width="3" /><path d="M22 22 L38 38 M38 22 L22 38" stroke="${color}" stroke-width="4" stroke-linecap="round" />`;
    } else if (type.id.startsWith('acc')) {
        content = `<path d="M10 30 Q30 10 50 30 Q30 50 10 30" fill="${color}" /><circle cx="30" cy="30" r="5" fill="white" />`;
    } else if (type.id.startsWith('book')) {
        content = `<rect x="15" y="10" width="30" height="40" fill="${color}" /><rect x="18" y="10" width="2" height="40" fill="rgba(0,0,0,0.2)" />`;
    } else if (type.id.startsWith('tea')) {
        content = `<path d="M15 25 Q15 50 30 50 Q45 50 45 25" fill="${color}" /><rect x="15" y="20" width="30" height="5" fill="${color}" />`;
    } else if (type.id.startsWith('flower')) {
        content = `<circle cx="30" cy="25" r="10" fill="${color}" /><circle cx="22" cy="20" r="8" fill="${color}" opacity="0.7" /><circle cx="38" cy="20" r="8" fill="${color}" opacity="0.7" /><circle cx="22" cy="30" r="8" fill="${color}" opacity="0.7" /><circle cx="38" cy="30" r="8" fill="${color}" opacity="0.7" /><path d="M30 35 L30 55" stroke="green" stroke-width="3" />`;
    } else {
        content = `<rect x="15" y="15" width="30" height="30" rx="8" fill="${color}" /><circle cx="30" cy="30" r="10" fill="rgba(255,255,255,0.3)" />`;
    }

    return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
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
        const radius = Math.random() * 200; 
        const x = centerX + Math.cos(angle) * (radius * 1.3) - 30;
        const y = centerY + Math.sin(angle) * radius - 30;
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
    div.innerHTML = getSVGForItem(type);
    div.title = type.name;

    // Dragging logic
    let isDragging = false;
    let offsetX, offsetY;

    div.addEventListener('mousedown', (e) => {
        if (!gameActive) return;
        isDragging = true;
        
        // Remove from sorting area if it was there
        const index = sortingAreaItems.indexOf(div);
        if (index > -1) {
            sortingAreaItems.splice(index, 1);
        }

        const rect = div.getBoundingClientRect();
        const parentRect = div.offsetParent.getBoundingClientRect();
        
        // Offset relative to the item's top-left corner
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        div.style.transition = 'none';
        
        // Bring to front
        div.style.zIndex = 1000;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const parentRect = div.offsetParent.getBoundingClientRect();
        const x = e.clientX - parentRect.left - offsetX;
        const y = e.clientY - parentRect.top - offsetY;
        
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        div.style.transition = 'transform 0.2s ease, left 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1), top 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)';

        checkDrop(div, e.clientX, e.clientY);
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
            const itemX = (areaRect.left - containerRect.left) + (areaRect.width / 3) * (index + 1) - 30;
            const itemY = (areaRect.top - containerRect.top) + (areaRect.height / 2) - 30;

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
    const radius = Math.random() * 200;
    const targetX = centerX + Math.cos(angle) * (radius * 1.3) - 30;
    const targetY = centerY + Math.sin(angle) * radius - 30;
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
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 10;
        
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
