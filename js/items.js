const ITEM_TYPES = [
    // Royalty & Magic
    { id: 'royal_crown', name: 'Golden Crown', icon: 'game-icons:crown', color: '#FFD700' },
    { id: 'royal_tiara', name: 'Sparkling Tiara', icon: 'game-icons:tiara', color: '#1E88E5' },
    { id: 'royal_wand', name: 'Magic Wand', icon: 'radix-icons:magic-wand', color: '#D4AF37' },
    { id: 'royal_slipper', name: 'Glass Slipper', icon: 'game-icons:glass-heart', color: '#64B5F6' },
    { id: 'royal_castle', name: 'Mini Castle', icon: 'game-icons:castle', color: '#E91E63' },
    { id: 'royal_carriage', name: 'Pumpkin Carriage', icon: 'game-icons:pumpkin-lantern', color: '#FB8C00' },
    { id: 'royal_mirror', name: 'Hand Mirror', icon: 'mdi:mirror', color: '#1E88E5' },
    { id: 'royal_gown', name: 'Ball Gown', icon: 'game-icons:clothespin', color: '#9C27B0' },
    { id: 'royal_ring', name: 'Ruby Ring', icon: 'game-icons:ring', color: '#D32F2F' },
    { id: 'royal_necklace', name: 'Pearl Necklace', icon: 'game-icons:necklace', color: '#5C6BC0' },
    
    // Stuffed Animals & Toys
    { id: 'toy_unicorn', name: 'Unicorn Plush', icon: 'game-icons:unicorn', color: '#E91E63' },
    { id: 'toy_bear', name: 'Teddy Bear', icon: 'fluent-emoji-high-contrast:teddy-bear', color: '#795548' },
    { id: 'toy_cat', name: 'Kitty Plush', icon: 'game-icons:cat', color: '#EF6C00' },
    { id: 'toy_bunny', name: 'Bunny Plush', icon: 'game-icons:rabbit', color: '#F48FB1' },
    { id: 'toy_dragon', name: 'Friendly Dragon', icon: 'game-icons:dragon-head', color: '#7B1FA2' },
    { id: 'toy_butterfly', name: 'Butterfly Toy', icon: 'game-icons:butterfly', color: '#8E24AA' },
    { id: 'toy_swan', name: 'Glass Swan', icon: 'game-icons:swan', color: '#00ACC1' },
    { id: 'toy_owl', name: 'Owl Plush', icon: 'game-icons:owl', color: '#33691E' },
    { id: 'toy_marionette', name: 'Marionette', icon: 'noto:japanese-dolls', color: '#A1887F' },
    { id: 'toy_mask', name: 'Masquerade Mask', icon: 'game-icons:drama-masks', color: '#4527A0' },

    // Beauty & Accessories
    { id: 'beauty_brush', name: 'Silver Hairbrush', icon: 'game-icons:hair-strands', color: '#9E9E9E' },
    { id: 'beauty_perfume', name: 'Magic Potion', icon: 'game-icons:vial', color: '#E91E63' },
    { id: 'beauty_perfume_round', name: 'Perfume Bottle', icon: 'game-icons:glass-shot', color: '#673AB7' },
    { id: 'beauty_ribbon', name: 'Silk Ribbon', icon: 'game-icons:ribbon', color: '#D50000' },
    { id: 'beauty_fan', name: 'Lace Fan', icon: 'icon-park-outline:fan', color: '#BF360C' },
    { id: 'beauty_comb', name: 'Ivory Comb', icon: 'game-icons:comb', color: '#BF360C' },
    { id: 'beauty_locket', name: 'Golden Locket', icon: 'game-icons:pendant-key', color: '#C49000' },
    { id: 'beauty_brooch', name: 'Flower Brooch', icon: 'fxemoji:gem', color: '#E91E63' },
    { id: 'beauty_earrings', name: 'Crystal Earrings', icon: 'game-icons:drop-weapon', color: '#0097A7' },
    { id: 'beauty_bracelet', name: 'Charm Bracelet', icon: 'game-icons:power-ring', color: '#A67C00' },

    // Tea Time & Sweets
    { id: 'tea_cup', name: 'Fancy Tea Cup', icon: 'game-icons:coffee-cup', color: '#8D6E63' },
    { id: 'tea_pot', name: 'Royal Teapot', icon: 'game-icons:teapot', color: '#2E7D32' },
    { id: 'tea_spoon', name: 'Silver Spoon', icon: 'game-icons:spoon', color: '#757575' },
    { id: 'tea_goblet', name: 'Crystal Goblet', icon: 'ep:goblet', color: '#0288D1' },
    { id: 'tea_plate', name: 'China Plate', icon: 'game-icons:plate-claw', color: '#00897B' },
    
    // Books & Letters
    { id: 'book_magic', name: 'Spellbook', icon: 'game-icons:magick-trick', color: '#C62828' },
    { id: 'book_poetry', name: 'Poetry Book', icon: 'game-icons:book-cover', color: '#1565C0' },
    { id: 'letter_sealed', name: 'Love Letter', icon: 'game-icons:love-letter', color: '#F06292' },
    { id: 'scroll_royal', name: 'Royal Decree', icon: 'ph:scroll-thin', color: '#A1887F' },
    { id: 'quill_pen', name: 'Quill & Ink', icon: 'game-icons:quill-ink', color: '#455A64' },

    // Flowers & Nature
    { id: 'nature_rose', name: 'Enchanted Rose', icon: 'game-icons:rose', color: '#D50000' },
    { id: 'nature_tulip', name: 'Pink Flower', icon: 'game-icons:flower-pot', color: '#EC407A' },
    { id: 'nature_lily', name: 'White Lily', icon: 'game-icons:lily-pads', color: '#EF9A9A' },
    { id: 'nature_flower', name: 'Spring Bloom', icon: 'game-icons:flower-twirl', color: '#FBC02D' },
    { id: 'nature_leaf', name: 'Silver Leaf', icon: 'game-icons:leaf-skeleton', color: '#607D8B' },

    // Miscellaneous
    { id: 'misc_key', name: 'Golden Key', icon: 'material-symbols:key-outline-rounded', color: '#FBC02D' },
    { id: 'misc_clock', name: 'Pocket Watch', icon: 'game-icons:pocket-watch', color: '#FFA000' },
    { id: 'misc_harp', name: 'Golden Harp', icon: 'game-icons:harp', color: '#FFB74D' },
    { id: 'misc_spinning', name: 'Spinning Wheel', icon: 'game-icons:circular-saw', color: '#5D4037' },
    { id: 'misc_cushion', name: 'Royal Cushion', icon: 'game-icons:square', color: '#B71C1C' }
];
