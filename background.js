chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Handle messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'claude-search') {
    claudeSearch(message.query).then(sendResponse);
    return true;
  }
});

async function claudeSearch(query) {
  try {
    const [orgCookie, sessionCookie] = await Promise.all([
      chrome.cookies.get({ url: 'https://claude.ai', name: 'lastActiveOrg' }),
      chrome.cookies.get({ url: 'https://claude.ai', name: 'sessionKey' })
    ]);
    const orgId = orgCookie?.value;
    if (!orgId || !sessionCookie) return { error: 'Not logged in to Claude' };

    const cookieStr = `lastActiveOrg=${orgCookie.value}; sessionKey=${sessionCookie.value}`;
    const resp = await fetch(
      `https://claude.ai/api/organizations/${orgId}/conversation/search?query=${encodeURIComponent(query)}&n=10`,
      { headers: { 'Cookie': cookieStr } }
    );
    const data = await resp.json();
    return { data };
  } catch(e) {
    return { error: e.message };
  }
}
