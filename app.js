// ========================================================================
// Agent Dashboard - app.js
// MakerWorks Lab
// ========================================================================

// ========================================================================
// GLOBAL VARIABLES
// ========================================================================

// Try to get token from config-token.js, otherwise use prompt
let GITHUB_TOKEN = '';

if (typeof GITHUB_TOKEN_CONFIG !== 'undefined' && GITHUB_TOKEN_CONFIG) {
    GITHUB_TOKEN = GITHUB_TOKEN_CONFIG;
} else {
    // Try localStorage
    GITHUB_TOKEN = localStorage.getItem('github_token') || '';

const API_BASE = 'https://api.github.com';

let workflowRuns = {
    'photo-sync': null,
    'blog-generator': null
};

let autoRefreshInterval = null;

// ========================================================================
// INITIALIZATION
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // Check for token
    if (!GITHUB_TOKEN) {
        showError('GitHub token not configured. Please set your token.');
        return;
    }
    
    // Apply theme
    applyTheme();
    
    // Load initial data
    await refreshAll();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Update time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

// ========================================================================
// THEME MANAGEMENT
// ========================================================================

function applyTheme() {
    if (CONFIG && CONFIG.DARK_MODE === false) {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
}

// ========================================================================
// AUTO REFRESH
// ========================================================================

function startAutoRefresh() {
    const interval = CONFIG ? CONFIG.REFRESH_INTERVAL : 30000;
    autoRefreshInterval = setInterval(refreshAll, interval);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// ========================================================================
// REFRESH FUNCTIONS
// ========================================================================

async function refreshAll() {
    updateLastUpdated();
    await Promise.all([
        refreshWorkflowStatus('photo-sync'),
        refreshWorkflowStatus('blog-generator')
    ]);
    await loadRunHistory();
}

function updateLastUpdated() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    document.getElementById('last-updated').textContent = `Last updated: ${timeStr}`;
}

async function refreshWorkflowStatus(agentKey) {
    const workflow = getWorkflowConfig(agentKey);
    if (!workflow) return;
    
    try {
        // Get workflow runs
        const runs = await githubApiGet(
            `/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/actions/workflows/${workflow.id}/runs?per_page=1`
        );
        
        if (runs.workflow_runs && runs.workflow_runs.length > 0) {
            const latestRun = runs.workflow_runs[0];
            workflowRuns[agentKey] = latestRun;
            updateAgentCard(agentKey, latestRun);
        } else {
            updateAgentCard(agentKey, null);
        }
    } catch (error) {
        console.error(`Error fetching ${agentKey}:`, error);
        updateAgentCard(agentKey, null, error.message);
    }
}

function getWorkflowConfig(agentKey) {
    if (!CONFIG || !CONFIG.WORKFLOWS) return null;
    return CONFIG.WORKFLOWS[agentKey];
}

// ========================================================================
// UPDATE AGENT CARD UI
// ========================================================================

function updateAgentCard(agentKey, runData, errorMessage = null) {
    const statusBadge = document.getElementById(`${agentKey}-status`);
    const lastRunEl = document.getElementById(`${agentKey}-last-run`);
    const durationEl = document.getElementById(`${agentKey}-duration`);
    const runInfoEl = document.getElementById(`${agentKey}-run-info`);
    const conclusionEl = document.getElementById(`${agentKey}-conclusion`);
    const errorEl = document.getElementById(`${agentKey}-error`);
    const errorTextEl = document.getElementById(`${agentKey}-error-text`);
    const runStatusEl = document.getElementById(`${agentKey}-run-status`);
    
    // If no data and no error
    if (!runData && !errorMessage) {
        statusBadge.className = 'status-badge';
        statusBadge.innerHTML = '<span class="status-dot loading"></span><span class="status-text">No runs yet</span>';
        lastRunEl.textContent = '--';
        durationEl.textContent = '--';
        runInfoEl.style.display = 'none';
        errorEl.style.display = 'none';
        return;
    }
    
    // If error
    if (errorMessage) {
        statusBadge.className = 'status-badge failed';
        statusBadge.innerHTML = '<span class="status-dot failed"></span><span class="status-text">Error</span>';
        lastRunEl.textContent = 'Failed to load';
        errorEl.style.display = 'block';
        errorTextEl.textContent = errorMessage;
        return;
    }
    
    // Get status
    const status = runData.status;
    const conclusion = runData.conclusion;
    
    // Update status badge
    if (status === 'in_progress' || status === 'queued') {
        statusBadge.className = 'status-badge running';
        statusBadge.innerHTML = '<span class="status-dot running"></span><span class="status-text">Running</span>';
    } else if (status === 'completed') {
        if (conclusion === 'success') {
            statusBadge.className = 'status-badge success';
            statusBadge.innerHTML = '<span class="status-dot success"></span><span class="status-text">Success</span>';
        } else if (conclusion === 'failure') {
            statusBadge.className = 'status-badge failed';
            statusBadge.innerHTML = '<span class="status-dot failed"></span><span class="status-text">Failed</span>';
        } else {
            statusBadge.className = 'status-badge queued';
            statusBadge.innerHTML = `<span class="status-dot"></span><span class="status-text">${conclusion}</span>`;
        }
    } else {
        statusBadge.className = 'status-badge queued';
        statusBadge.innerHTML = '<span class="status-dot"></span><span class="status-text">' + status + '</span>';
    }
    
    // Update last run time
    const runDate = new Date(runData.created_at);
    lastRunEl.textContent = getRelativeTime(runDate);
    
    // Update duration
    if (runData.updated_at && runData.created_at) {
        const start = new Date(runData.created_at);
        const end = new Date(runData.updated_at);
        const diffMs = end - start;
        durationEl.textContent = formatDuration(diffMs);
    }
    
    // Update run info
    runInfoEl.style.display = 'block';
    runStatusEl.textContent = runData.name || 'Workflow Run';
    
    // Update conclusion
    conclusionEl.className = 'run-conclusion ' + (conclusion || '');
    conclusionEl.querySelector('span').textContent = conclusion || status;
    
    // Show/hide error details
    if (conclusion === 'failure') {
        errorEl.style.display = 'block';
        errorTextEl.textContent = runData.head_branch + ' - ' + (runData.message || 'Workflow failed');
    } else {
        errorEl.style.display = 'none';
    }
}

// ========================================================================
// RUN WORKFLOW
// ========================================================================

async function runWorkflow(agentKey) {
    const workflow = getWorkflowConfig(agentKey);
    if (!workflow) {
        showError('Workflow configuration not found');
        return;
    }
    
    // Show loading overlay
    showLoading(true);
    
    try {
        // Trigger workflow
        await githubApiPost(
            `/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/actions/workflows/${workflow.id}/dispatches`,
            {
                ref: 'main'
            }
        );
        
        // Refresh after a short delay
        setTimeout(async () => {
            await refreshWorkflowStatus(agentKey);
            showLoading(false);
        }, 2000);
        
    } catch (error) {
        showLoading(false);
        showError(`Failed to run workflow: ${error.message}`);
    }
}

// ========================================================================
// VIEW LOGS
// ========================================================================

function openLogs(agentKey) {
    const runData = workflowRuns[agentKey];
    if (!runData || !runData.html_url) {
        showError('No run data available');
        return;
    }
    
    // Open GitHub Actions logs in new tab
    window.open(runData.html_url, '_blank');
}

// ========================================================================
// RUN HISTORY
// ========================================================================

async function loadRunHistory() {
    const historyList = document.getElementById('history-list');
    
    try {
        // Get all workflow runs
        const runs = await githubApiGet(
            `/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/actions/runs?per_page=10`
        );
        
        if (!runs.workflow_runs || runs.workflow_runs.length === 0) {
            historyList.innerHTML = '<div class="history-loading">No runs yet</div>';
            return;
        }
        
        // Build history HTML
        let html = '';
        
        for (const run of runs.workflow_runs) {
            const agentKey = getAgentKeyFromWorkflow(run.workflow_id);
            if (!agentKey) continue;
            
            const iconClass = agentKey === 'photo-sync' ? 'photo' : 'blog';
            const icon = agentKey === 'photo-sync' ? '<i class="fas fa-camera"></i>' : '<i class="fas fa-blog"></i>';
            const name = agentKey === 'photo-sync' ? 'Photo Sync Agent' : 'Blog Generator Agent';
            
            const statusClass = run.conclusion === 'success' ? 'success' : 
                              run.conclusion === 'failure' ? 'failed' : 'running';
            
            const runDate = new Date(run.created_at);
            
            html += `
                <div class="history-item">
                    <div class="history-item-icon ${iconClass}">${icon}</div>
                    <div class="history-item-info">
                        <div class="history-item-title">${name}</div>
                        <div class="history-item-time">${getRelativeTime(runDate)}</div>
                    </div>
                    <div class="history-item-status ${statusClass}">${run.conclusion || run.status}</div>
                </div>
            `;
        }
        
        historyList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<div class="history-loading">Failed to load history</div>';
    }
}

function getAgentKeyFromWorkflow(workflowId) {
    if (!CONFIG || !CONFIG.WORKFLOWS) return null;
    
    // Check if workflow ID matches
    for (const [key, config] of Object.entries(CONFIG.WORKFLOWS)) {
        if (config.id.includes(workflowId.toString()) || workflowId.toString().includes(config.id)) {
            return key;
        }
    }
    
    return null;
}

// ========================================================================
// GITHUB API FUNCTIONS
// ========================================================================

async function githubApiGet(endpoint) {
    const response = await fetch(API_BASE + endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
    }
    
    return response.json();
}

async function githubApiPost(endpoint, data) {
    const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
    }
    
    return response.json();
}

// ========================================================================
// UI HELPERS
// ========================================================================

function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const banner = document.getElementById('error-banner');
    const text = document.getElementById('error-message');
    text.textContent = message;
    banner.style.display = 'flex';
}

function hideError() {
    document.getElementById('error-banner').style.display = 'none';
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString();
}

// ========================================================================
// TIME FORMATTING
// ========================================================================

function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}m ${minutes % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// ========================================================================
// TOKEN CONFIGURATION
// ========================================================================

// IMPORTANT: Set your GitHub Personal Access Token here
// DO NOT commit this file to GitHub with your actual token!

// For now, we'll check localStorage or prompt the user
function getToken() {
    // First check if already set
    if (GITHUB_TOKEN) return GITHUB_TOKEN;
    
    // Check localStorage
    const stored = localStorage.getItem('github_token');
    if (stored) {
        GITHUB_TOKEN = stored;
        return GITHUB_TOKEN;
    }
    
    // Prompt user (only works if opened locally)
    const token = prompt('Please enter your GitHub Personal Access Token:');
    if (token) {
        localStorage.setItem('github_token', token);
        GITHUB_TOKEN = token;
    }
    
    return GITHUB_TOKEN;
}

// Override init to set token first
const originalInit = init;
init = async function() {
    await getToken();
    if (!GITHUB_TOKEN) {
        showError('GitHub token required. Please refresh and enter your token.');
        return;
    }
    originalInit();
};
