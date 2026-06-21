const ITEM_TYPES = [
    // Royalty & Magic
    { id: 'royal_crown', name: 'Golden Crown', icon: 'game-icons:crown', color: '#FFD700' },
    { id: 'royal_tiara', name: 'Sparkling Tiara', icon: 'game-icons:tiara', color: '#BDE0FE' },
    { id: 'royal_wand', name: 'Magic Wand', icon: 'game-icons:magic-wand', color: '#D4AF37' },
    { id: 'royal_slipper', name: 'Glass Slipper', icon: 'game-icons:glass-heart', color: '#87CEEB' },
    { id: 'royal_castle', name: 'Mini Castle', icon: 'game-icons:castle', color: '#FFB6C1' },
    { id: 'royal_carriage', name: 'Pumpkin Carriage', icon: 'game-icons:pumpkin-lantern', color: '#FFA500' },
    { id: 'royal_mirror', name: 'Hand Mirror', icon: 'game-icons:hand-mirror', color: '#4682B4' },
    { id: 'royal_gown', name: 'Ball Gown', icon: 'game-icons:clothespin', color: '#DA70D6' },
    { id: 'royal_ring', name: 'Ruby Ring', icon: 'game-icons:ring', color: '#E0115F' },
    { id: 'royal_necklace', name: 'Pearl Necklace', icon: 'game-icons:necklace', color: '#B0C4DE' },
    
    // Stuffed Animals & Toys
    { id: 'toy_unicorn', name: 'Unicorn Plush', icon: 'game-icons:unicorn', color: '#FFB7CE' },
    { id: 'toy_bear', name: 'Teddy Bear', icon: 'game-icons:teddy-bear', color: '#A0522D' },
    { id: 'toy_cat', name: 'Kitty Plush', icon: 'game-icons:cat', color: '#F4A460' },
    { id: 'toy_bunny', name: 'Bunny Plush', icon: 'game-icons:rabbit', color: '#FFC0CB' },
    { id: 'toy_dragon', name: 'Friendly Dragon', icon: 'game-icons:dragon-head', color: '#9400D3' },
    { id: 'toy_butterfly', name: 'Butterfly Toy', icon: 'game-icons:butterfly', color: '#9932CC' },
    { id: 'toy_swan', name: 'Glass Swan', icon: 'game-icons:swan', color: '#00CED1' },
    { id: 'toy_owl', name: 'Owl Plush', icon: 'game-icons:owl', color: '#556B2F' },
    { id: 'toy_marionette', name: 'Marionette', icon: 'game-icons:marionette', color: '#CD853F' },
    { id: 'toy_mask', name: 'Masquerade Mask', icon: 'game-icons:masquerade', color: '#4B0082' },

    // Beauty & Accessories
    { id: 'beauty_brush', name: 'Silver Hairbrush', icon: 'game-icons:hair-strands', color: '#C0C0C0' },
    { id: 'beauty_perfume', name: 'Magic Potion', icon: 'game-icons:vial', color: '#FF00FF' },
    { id: 'beauty_perfume_round', name: 'Perfume Bottle', icon: 'game-icons:glass-shot', color: '#9370DB' },
    { id: 'beauty_ribbon', name: 'Silk Ribbon', icon: 'game-icons:ribbon', color: '#FF0000' },
    { id: 'beauty_fan', name: 'Lace Fan', icon: 'game-icons:hand-fan', color: '#FF8C00' },
    { id: 'beauty_comb', name: 'Ivory Comb', icon: 'game-icons:comb', color: '#E2725B' },
    { id: 'beauty_locket', name: 'Golden Locket', icon: 'game-icons:pendant-key', color: '#DAA520' },
    { id: 'beauty_brooch', name: 'Flower Brooch', icon: 'game-icons:flower-gem', color: '#FF69B4' },
    { id: 'beauty_earrings', name: 'Crystal Earrings', icon: 'game-icons:drop-weapon', color: '#40E0D0' },
    { id: 'beauty_bracelet', name: 'Charm Bracelet', icon: 'game-icons:power-ring', color: '#B8860B' },

    // Tea Time & Sweets
    { id: 'tea_cup', name: 'Fancy Tea Cup', icon: 'game-icons:coffee-cup', color: '#D2B48C' },
    { id: 'tea_pot', name: 'Royal Teapot', icon: 'game-icons:teapot', color: '#3CB371' },
    { id: 'tea_spoon', name: 'Silver Spoon', icon: 'game-icons:spoon', color: '#A9A9A9' },
    { id: 'tea_goblet', name: 'Crystal Goblet', icon: 'game-icons:goblet', color: '#00BFFF' },
    { id: 'tea_plate', name: 'China Plate', icon: 'game-icons:plate-claw', color: '#20B2AA' },
    
    // Books & Letters
    { id: 'book_magic', name: 'Spellbook', icon: 'game-icons:magick-trick', color: '#B22222' },
    { id: 'book_poetry', name: 'Poetry Book', icon: 'game-icons:book-cover', color: '#4169E1' },
    { id: 'letter_sealed', name: 'Love Letter', icon: 'game-icons:love-letter', color: '#FA8072' },
    { id: 'scroll_royal', name: 'Royal Decree', icon: 'game-icons:sealed-scroll', color: '#DEB887' },
    { id: 'quill_pen', name: 'Quill & Ink', icon: 'game-icons:quill-ink', color: '#708090' },

    // Flowers & Nature
    { id: 'nature_rose', name: 'Enchanted Rose', icon: 'game-icons:rose', color: '#FF0000' },
    { id: 'nature_tulip', name: 'Pink Tulip', icon: 'game-icons:tulip', color: '#FF69B4' },
    { id: 'nature_lily', name: 'White Lily', icon: 'game-icons:lily-pads', color: '#F08080' },
    { id: 'nature_flower', name: 'Spring Bloom', icon: 'game-icons:flower-twirl', color: '#FFFF00' },
    { id: 'nature_leaf', name: 'Silver Leaf', icon: 'game-icons:leaf-skeleton', color: '#778899' },

    // Miscellaneous
    { id: 'misc_key', name: 'Golden Key', icon: 'game-icons:old-key', color: '#FFD700' },
    { id: 'misc_clock', name: 'Pocket Watch', icon: 'game-icons:pocket-watch', color: '#DAA520' },
    { id: 'misc_harp', name: 'Golden Harp', icon: 'game-icons:harp', color: '#FFDAB9' },
    { id: 'misc_spinning', name: 'Spinning Wheel', icon: 'game-icons:circular-saw', color: '#8B4513' },
    { id: 'misc_cushion', name: 'Royal Cushion', icon: 'game-icons:square', color: '#DC143C' }
];
