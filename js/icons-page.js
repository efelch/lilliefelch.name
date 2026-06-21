document.addEventListener('DOMContentLoaded', () => {
    const iconsGrid = document.getElementById('icons-grid');
    
    if (!iconsGrid) return;

    ITEM_TYPES.forEach(item => {
        const iconCard = document.createElement('div');
        iconCard.className = 'icon-card';
        
        // Iconify icons in ITEM_TYPES are in format 'game-icons:crown'
        // We can link to Iconify's search or directly to the icon if we know the pattern.
        // For game-icons, they usually come from game-icons.net.
        // Iconify link: https://icon-sets.iconify.design/game-icons/[name]/
        
        const [prefix, iconName] = item.icon.split(':');
        const iconLink = `https://icon-sets.iconify.design/${prefix}/${iconName}/`;

        iconCard.innerHTML = `
            <div class="icon-preview" style="color: ${item.color}">
                <iconify-icon icon="${item.icon}"></iconify-icon>
            </div>
            <div class="icon-info">
                <span class="icon-item-name">${item.name}</span>
                <span class="icon-slug">${item.icon}</span>
                <a href="${iconLink}" target="_blank" class="icon-source-link">View Source</a>
            </div>
        `;
        
        iconsGrid.appendChild(iconCard);
    });
});
