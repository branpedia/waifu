document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const waifuImage = document.getElementById('waifu-image');
    const newWaifuBtn = document.getElementById('new-waifu');
    const downloadBtn = document.getElementById('download-btn');
    const likeBtn = document.getElementById('like-btn');
    const tagSelect = document.getElementById('tag-select');
    const nsfwToggle = document.getElementById('nsfw-toggle');
    const waifuSource = document.getElementById('waifu-source');
    const favoritesGrid = document.getElementById('favorites-grid');
    const loader = document.querySelector('.loader');
    
    // State
    let currentWaifu = null;
    let nsfwEnabled = false;
    let favorites = JSON.parse(localStorage.getItem('waifuFavorites')) || [];
    
    // Initialize
    renderFavorites();
    fetchWaifu();
    
    // Event Listeners
    newWaifuBtn.addEventListener('click', fetchWaifu);
    downloadBtn.addEventListener('click', downloadImage);
    likeBtn.addEventListener('click', toggleFavorite);
    nsfwToggle.addEventListener('click', toggleNsfw);
    
    // Functions
    async function fetchWaifu() {
        try {
            // Show loader and hide current image
            loader.style.display = 'block';
            waifuImage.style.display = 'none';
            
            const selectedTag = tagSelect.value;
            const url = `https://api.waifu.im/search/?included_tags=${selectedTag}&is_nsfw=${nsfwEnabled}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if(data.images && data.images.length > 0) {
                currentWaifu = data.images[0];
                waifuImage.src = currentWaifu.url;
                waifuImage.alt = `Waifu image - ${currentWaifu.tags.map(tag => tag.name).join(', ')}`;
                
                // Set source information
                const sourceText = currentWaifu.source ? 
                    `Source: <a href="${currentWaifu.source}" target="_blank">${currentWaifu.source}</a>` : 
                    'Source: Unknown';
                waifuSource.innerHTML = sourceText;
                
                // Check if current waifu is favorited
                const isFavorited = favorites.some(fav => fav.url === currentWaifu.url);
                likeBtn.classList.toggle('liked', isFavorited);
                
                // Hide loader and show image when loaded
                waifuImage.onload = function() {
                    loader.style.display = 'none';
                    waifuImage.style.display = 'block';
                };
            } else {
                throw new Error('No images found');
            }
        } catch (error) {
            console.error('Error fetching waifu:', error);
            loader.style.display = 'none';
            waifuSource.textContent = 'Failed to load waifu. Please try again.';
        }
    }
    
    function downloadImage() {
        if (!currentWaifu) return;
        
        const link = document.createElement('a');
        link.href = currentWaifu.url;
        link.download = `waifu-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function toggleFavorite() {
        if (!currentWaifu) return;
        
        const index = favorites.findIndex(fav => fav.url === currentWaifu.url);
        
        if (index === -1) {
            // Add to favorites
            favorites.push(currentWaifu);
            likeBtn.classList.add('liked');
        } else {
            // Remove from favorites
            favorites.splice(index, 1);
            likeBtn.classList.remove('liked');
        }
        
        // Save to localStorage
        localStorage.setItem('waifuFavorites', JSON.stringify(favorites));
        renderFavorites();
    }
    
    function renderFavorites() {
        favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = '<p>No favorites yet. Click the heart to save waifus!</p>';
            return;
        }
        
        favorites.forEach((waifu, index) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            
            favoriteItem.innerHTML = `
                <img src="${waifu.url}" alt="Favorite waifu">
                <button class="remove-favorite" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            favoritesGrid.appendChild(favoriteItem);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                favorites.splice(index, 1);
                localStorage.setItem('waifuFavorites', JSON.stringify(favorites));
                renderFavorites();
                
                // If the removed favorite is the current waifu, update the like button
                if (currentWaifu && currentWaifu.url === favorites[index]?.url) {
                    likeBtn.classList.remove('liked');
                }
            });
        });
    }
    
    function toggleNsfw() {
        nsfwEnabled = !nsfwEnabled;
        nsfwToggle.classList.toggle('nsfw-enabled', nsfwEnabled);
        nsfwToggle.textContent = nsfwEnabled ? 'NSFW Enabled' : 'SFW Only';
    }
});
