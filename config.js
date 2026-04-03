// ========================================================================
// CONFIGURATION - Edit these values
// ========================================================================

const CONFIG = {
    // REPLACE WITH YOUR VALUES
    GITHUB_OWNER: 'ummadi-ajay',
    GITHUB_REPO: 'ummadi-ajay.github.io',
    
    // Workflow IDs (found in GitHub Actions URL or API)
    WORKFLOWS: {
        'photo-sync': {
            id: 'photo-sync.yml',
            name: '📷 Photo Sync Agent',
            description: 'Syncs photos from Google Drive to gallery'
        },
        'blog-generator': {
            id: 'blog-generator.yml',
            name: '📝 Blog Generator Agent',
            description: 'Generates robotics blog posts'
        }
    },
    
    // REFRESH INTERVAL (in milliseconds)
    REFRESH_INTERVAL: 30000, // 30 seconds
    
    // THEME
    DARK_MODE: true
};

// ========================================================================
// NOTE: Set your GitHub Personal Access Token in config.js
// Create config.js with your token - DO NOT commit this to GitHub!
// ========================================================================
