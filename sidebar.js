document.addEventListener('DOMContentLoaded', () => {
  const PROVIDERS = {
    claude: { url: 'https://claude.ai/new', frameId: 'frame-claude', color: '#262624' },
    chatgpt: { url: 'https://chatgpt.com', frameId: 'frame-chatgpt', color: '#212121' },
    gemini: { url: 'https://gemini.google.com/app', frameId: 'frame-gemini', color: '#000000' }
  };

  let activeProvider = 'claude';
  const loaded = { claude: true, chatgpt: false, gemini: false };

  const menuBtn = document.getElementById('menu-btn');
  const menuPanel = document.getElementById('claude-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const searchInput = document.getElementById('menu-search-input');
  const menuResults = document.getElementById('menu-results');
  let menuOpen = false;
  let searchTimeout = null;

  function updateMenuBtn() {
    menuBtn.style.display = activeProvider === 'claude' ? '' : 'none';
    if (activeProvider !== 'claude') closeMenu();
  }

  function openMenu() {
    menuPanel.classList.add('open');
    menuOverlay.classList.add('open');
    menuOpen = true;
    searchInput.value = '';
    menuResults.innerHTML = '';
    setTimeout(() => searchInput.focus(), 200);
  }

  function closeMenu() {
    menuPanel.classList.remove('open');
    menuOverlay.classList.remove('open');
    menuOpen = false;
  }

  menuBtn.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  menuOverlay.addEventListener('click', closeMenu);

  // Navigation
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const path = item.dataset.url;
      // Code opens in a new tab (redirects to a different domain)
      if (path === '/code/') {
        window.open('https://claude.ai/code/', '_blank');
        closeMenu();
        return;
      }
      document.getElementById('frame-claude').src = 'https://claude.ai' + path;
      closeMenu();
    });
  });

  // Search via background service worker
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    if (!query) {
      menuResults.innerHTML = '';
      return;
    }
    searchTimeout = setTimeout(() => {
      menuResults.innerHTML = '<div class="menu-loading">Searching...</div>';
      chrome.runtime.sendMessage({ type: 'claude-search', query }, (response) => {
        if (!response || response.error) {
          menuResults.innerHTML = '<div class="menu-empty">Search failed</div>';
          return;
        }
        // Parse response — API returns { chunks: [...] } with extras per chunk
        const raw = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        const chunks = raw.chunks || raw;
        if (!chunks || chunks.length === 0) {
          menuResults.innerHTML = '<div class="menu-empty">No results</div>';
          return;
        }
        // Deduplicate by conversation UUID
        const seen = new Set();
        const conversations = [];
        for (const chunk of chunks) {
          const uuid = chunk.extras?.conversation_uuid || chunk.uuid || chunk.id;
          if (!uuid || seen.has(uuid)) continue;
          seen.add(uuid);
          conversations.push({
            uuid,
            title: chunk.extras?.conversation_title || chunk.name || 'Untitled'
          });
        }
        if (conversations.length === 0) {
          menuResults.innerHTML = '<div class="menu-empty">No results</div>';
          return;
        }
        menuResults.innerHTML = '';
        conversations.forEach(conv => {
          const el = document.createElement('a');
          el.className = 'menu-result';
          el.textContent = conv.title;
          el.addEventListener('click', () => {
            document.getElementById('frame-claude').src = 'https://claude.ai/chat/' + conv.uuid;
            closeMenu();
          });
          menuResults.appendChild(el);
        });
      });
    }, 300);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const provider = tab.dataset.provider;
      if (provider === activeProvider) return;

      document.querySelector('.tab.active').classList.remove('active');
      tab.classList.add('active');

      document.querySelector('.chat-frame.active').classList.remove('active');
      const frame = document.getElementById(PROVIDERS[provider].frameId);

      if (!loaded[provider]) {
        frame.src = PROVIDERS[provider].url;
        loaded[provider] = true;
      }

      frame.classList.add('active');
      activeProvider = provider;

      document.querySelector('.toolbar').style.background = PROVIDERS[provider].color;
      updateMenuBtn();
    });
  });

  document.getElementById('refresh-btn').addEventListener('click', () => {
    const frame = document.getElementById(PROVIDERS[activeProvider].frameId);
    frame.src = frame.src;
  });

  document.getElementById('popout-btn').addEventListener('click', () => {
    const frame = document.getElementById(PROVIDERS[activeProvider].frameId);
    window.open(frame.src || PROVIDERS[activeProvider].url, '_blank');
  });

  updateMenuBtn();
});
