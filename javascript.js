// Load URLs and check auth status when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication status
        const authResponse = await fetch('/api/auth/check', {
            credentials: 'include'
        });

        const authButton = document.getElementById('authButton');
        if (authResponse.ok) {
            authButton.textContent = 'Logout';
            // Initial load of URLs
            await loadUrls();
        } else {
            // Redirect to home page if not authenticated
            window.location.href = '/';
            return;
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Redirect to home page on error
        window.location.href = '/';
    }
});

function handleAuthAction() {
    const authButton = document.getElementById('authButton');
    if (authButton.textContent === 'Login') {
        openAuthPopup();
    } else {
        handleLogout();
    }
}

function openAuthPopup() {
    const popup = document.getElementById('authPopup');
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    document.getElementById('loginUsername').focus();
}

function closeAuthPopup() {
    const popup = document.getElementById('authPopup');
    popup.classList.remove('flex');
    popup.classList.add('hidden');
}

function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('registerUsername').focus();
}

function switchToLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginUsername').focus();
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });

        if (response.ok) {
            closeAuthPopup();
            document.getElementById('authButton').textContent = 'Logout';
            showToast('Login successful');
            loadUrls();
        } else {
            showToast('Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            showToast('Registration successful. Please check your email for verification.');
            switchToLogin();
        } else {
            const data = await response.json();
            showToast(data.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        document.getElementById('authButton').textContent = 'Login';
        const urlItems = document.getElementById('urlItems');
        urlItems.innerHTML = ''; // Clear the URL list
        showToast('Logged out successfully');
        // Redirect to home page after logout
        window.location.href = '/';
    } catch (error) {
        showToast('Logout failed', 'error');
    }
}

//use regular fetch to get the urls
async function loadUrls() {
    try {
        const response = await fetch('/api/urls', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            showToast('Please log in to view URLs', 'error');
            document.getElementById('authButton').textContent = 'Login';
            openAuthPopup();
            return false;
        }

        if (response.ok) {
        const urls = await response.json();
        console.log('Loaded URLs:', urls); // Debug log to see response
            const urlItems = document.getElementById('urlItems');
            urlItems.innerHTML = ''; // Clear existing items
        urls.forEach(url => {
            addUrlToList(url);
        });
            return urls.length > 0;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error loading URLs:', error);
        return false;
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.error('Toast container not found');
        return;
    }

    // Check if we already have 5 toasts
    if (container.children.length >= 5) {
        // Remove the oldest toast (first child)
        const oldToast = container.firstChild;
        oldToast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (container.contains(oldToast)) {
                container.removeChild(oldToast);
            }
        }, 500);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg mb-2 min-w-[200px] max-w-[400px] opacity-0 translate-x-full transition-all duration-500 ${type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`;
    toast.textContent = message;

    // Add to container
    container.appendChild(toast);

    // Trigger reflow to ensure transition works
    toast.offsetHeight;

    // Show the toast
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-full');
    });

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 500);
    }, 5000);
}

async function openAddUrlPopup() {
    const authButton = document.getElementById('authButton');
    if (authButton.textContent === 'Login') {
        showToast('Please log in to add URLs', 'error');
        openAuthPopup();
        return;
    }

    const popup = document.getElementById('addUrlPopup');
    popup.classList.remove('hidden');
    popup.classList.add('flex');
    document.getElementById('urlInput').value = ''; // Clear input
    document.getElementById('urlInput').focus(); // Focus input
}

function closeAddUrlPopup() {
    const popup = document.getElementById('addUrlPopup');
    popup.classList.remove('flex');
    popup.classList.add('hidden');
}

// Update the addUrl function
async function addUrl() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();

    // Regex check if it's a JavaScript URL
    const jsUrlPattern = /^https?:\/\/.*\.js$/;
    if (!url || !jsUrlPattern.test(url)) {
        showToast("Please enter a valid javascript url", "error");
        return;
    }

    try {
        const response = await fetch('/api/urls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            showToast(errorData.error || 'Error adding URL', 'error');
            return;
        }

        const newUrl = await response.json();
        addUrlToList(newUrl);
        urlInput.value = '';
        closeAddUrlPopup(); // Close popup on success
        showToast('URL added successfully');
    } catch (error) {
        console.error('Error adding URL:', error);
        showToast('Request failed', 'error');
    }
}

async function deleteUrl(hash) {
    try {
        const response = await fetch(`/api/urls/${hash}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.status === 401) {
            showToast('Authentication failed', 'error');
            return;
        }

        if (response.ok) {
            const urlItem = document.querySelector(`[data-hash="${hash}"]`);
            urlItem.remove();
            showToast('URL deleted successfully');
        } else {
            showToast('Failed to delete URL', 'error');
        }
    } catch (error) {
        console.error('Error deleting URL:', error);
        showToast('Request failed', 'error');
    }
}

// Add this new function to handle dropdown toggling
function toggleDropdown(hash) {
    const dropdowns = document.querySelectorAll('.actions-dropdown > div');
    dropdowns.forEach(dropdown => {
        if (dropdown.id !== `dropdown-${hash}`) {
            dropdown.classList.add('hidden');
        }
    });

    const dropdown = document.getElementById(`dropdown-${hash}`);
    dropdown.classList.toggle('hidden');
}

// Handle click outside for all popups
document.addEventListener('click', (event) => {
    // Handle dropdowns
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('show-dropdown')) {
                dropdown.classList.remove('show-dropdown');
            }
        });
    }

    // Handle popups
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        if (popup.classList.contains('show') && 
            !popup.querySelector('.popup-content').contains(event.target) && 
            !event.target.matches('.auth-button') && // Don't close if clicking the auth button
            !event.target.matches('.add-url-button')) { // Don't close if clicking the add URL button
            
            if (popup === document.getElementById('authPopup')) {
                closeAuthPopup();
            } else if (popup === document.getElementById('addUrlPopup')) {
                closeAddUrlPopup();
            }
        }
    });
});

// Prevent popup content clicks from closing the popup
document.querySelectorAll('.popup-content').forEach(content => {
    content.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});

// Add this new function to track the currently open diff
let currentOpenDiffHash = null;

function addUrlToList(url, data) {
    const urlItems = document.getElementById('urlItems');
    const emptyState = document.getElementById('emptyState');
    
    // Hide empty state when adding URLs
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    const urlItem = document.createElement('div');
    urlItem.className = 'grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/50';
    urlItem.setAttribute('data-hash', url.urlHash);

    // Handle both old and new response formats
    let wordCount = 0;
    let version = 1;
    
    if (url.versions) {
        // Old format with versions object
        wordCount = url.versions[`version${Object.keys(url.versions).length}`]?.wordCount || 0;
        version = Object.keys(url.versions).length || 1;
    } else {
        // New format with direct properties
        wordCount = url.wordCount || 0;
        version = url.version || 1;
    }

    // Add click handler for the entire row if there are changes to view
    if (version > 1) {
        urlItem.style.cursor = 'pointer';
        urlItem.addEventListener('click', (event) => {
            // Don't trigger if clicking on the actions dropdown
            if (!event.target.closest('.actions-dropdown')) {
                if (currentOpenDiffHash === url.urlHash) {
                    // If clicking the same row, close the panel
                    closeSidePanel();
                    currentOpenDiffHash = null;
                } else {
                    // If clicking a different row, show its diff
                    viewDiff(url.urlHash, version);
                    currentOpenDiffHash = url.urlHash;
                }
            }
        });
    }

    urlItem.innerHTML = `
        <div class="col-span-6 truncate">${url.url}</div>
        <div class="col-span-2 text-center">${wordCount}</div>
        <div class="col-span-2 text-center">${version}</div>
        <div class="col-span-2 text-right">
            <div class="actions-dropdown inline-block relative">
                <button onclick="event.stopPropagation(); toggleDropdown('${url.urlHash}')" class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">Actions ▼</button>
                <div id="dropdown-${url.urlHash}" class="hidden absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg z-50">
                    <button onclick="checkForContentUpdate('${url.urlHash}')" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">Rescan</button>
                    <button onclick="deleteUrl('${url.urlHash}')" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">Delete</button>
                </div>
            </div>
        </div>
    `;
    urlItems.appendChild(urlItem);
}

// if user is unauthenticated, dont check for updates, if user hasnt added any urls, dont check for updates every 9 seconds
async function checkForContentUpdate(hash) {
    try {
        const response = await fetch(`/api/urls/update/${hash}`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (response.status === 401) {
            showToast('Please log in to update URLs', 'error');
            document.getElementById('authButton').textContent = 'Login';
            openAuthPopup();
            return;
        }

        const urlData = await response.json();

        if (urlData.message === 'No changes detected') {
            showToast('No updates found for this URL');
            return;
        }

        // Update the existing URL item in the list
        const urlItem = document.querySelector(`[data-hash="${hash}"]`);
        if (urlItem) {
            const wordCountElement = urlItem.querySelector('.word-count');
            const versionElement = urlItem.querySelector('.version');
            if (wordCountElement && versionElement) {
                // Handle both old and new response formats
                if (urlData.versions) {
                    // Old format with versions object
                    const latestVersion = Math.max(...Object.values(urlData.versions).map(v => v.version));
                    wordCountElement.textContent = urlData.versions[`version${latestVersion}`].wordCount;
                    versionElement.textContent = latestVersion;
                } else {
                    // New format with direct properties
                    wordCountElement.textContent = urlData.wordCount;
                    versionElement.textContent = urlData.version;
                }
            }
        }
        showToast('Updates found and applied!');
    } catch (error) {
        console.error('Error checking for updates:', error);
        showToast('Error checking for updates', 'error');
    }
}

// Update the closeSidePanel function
function closeSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.remove('translate-x-0');
    sidePanel.classList.add('translate-x-full');
    currentOpenDiffHash = null;
}

// Add click outside handler for the side panel
document.addEventListener('click', (event) => {
    const sidePanel = document.getElementById('sidePanel');
    // If side panel is open and click is outside the panel and not on a URL item
    if (sidePanel.classList.contains('translate-x-0') && 
        !sidePanel.contains(event.target) && 
        !event.target.closest('.url-item')) {
        closeSidePanel();
    }
});

// Add a function to escape HTML content
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function viewDiff(hash, latestVersion) {
    try {
        const allDiffs = [];
        // Fetch diffs for all sequential versions
        for (let version = 2; version <= latestVersion; version++) {
            const response = await fetch(`/api/urls/diff/${hash}/${version}`, {
                credentials: 'include'
        });

        if (response.status === 401) {
                showToast('Authentication failed', 'error');
                return;
            }

            const diffData = await response.json();
            if (diffData) {
                allDiffs.push(diffData);
            }
        }

        if (allDiffs.length === 0) {
            showToast('Could not load changes', 'error');
            return;
        }

        // Update side panel content
        const sidePanel = document.getElementById('sidePanel');
        const urlInfo = sidePanel.querySelector('.url-info');
        const contentDisplay = sidePanel.querySelector('.content-display');

        urlInfo.innerHTML = `
            <h3>Version History</h3>
        `;

        let formattedContent = '';
        
        // Display diffs for each version pair in reverse order (newest first)
        allDiffs.reverse().forEach(diffData => {
            // Create arrays to track line changes
            const allLines = new Set();
            const removedLines = new Set(diffData.changes.removed.filter(line => line.trim() !== ''));
            const addedLines = new Set(diffData.changes.added.filter(line => line.trim() !== ''));
            
            // Collect all non-empty lines
            removedLines.forEach(line => allLines.add(line));
            addedLines.forEach(line => allLines.add(line));
            
            // Sort lines to maintain original order
            const sortedLines = Array.from(allLines).sort();
            
            if (sortedLines.length > 0) {
                formattedContent += `
                    <div class="diff-content">
                        <h3>Version ${diffData.oldVersion} → Version ${diffData.newVersion}</h3>
                        <div class="diff-comparison">
                            <div class="diff-header">Changes</div>
                            <pre>`;

                // Add line numbers and content with appropriate highlighting
                sortedLines.forEach((line, index) => {
                    const escapedLine = escapeHtml(line);
                    const lineNumber = index + 1;
                    
                    if (removedLines.has(line)) {
                        formattedContent += `<span class="diff-line removed"><span class="diff-line-number">${lineNumber}</span>${escapedLine}</span>\n`;
                    } else if (addedLines.has(line)) {
                        formattedContent += `<span class="diff-line added"><span class="diff-line-number">${lineNumber}</span>${escapedLine}</span>\n`;
                    }
                });

                formattedContent += `</pre>
                        </div>
                    </div>
                    ${diffData !== allDiffs[allDiffs.length - 1] ? '<hr class="diff-separator">' : ''}
                `;
            }
        });

        contentDisplay.innerHTML = formattedContent;

        // Open side panel
        sidePanel.classList.add('translate-x-0');
    } catch (error) {
        console.error('Error fetching diffs:', error);
        showToast('Error loading changes', 'error');
    }
} 