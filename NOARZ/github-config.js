/**
 * GitHub API Configuration
 * This file contains the configuration for the GitHub API integration
 *
 * IMPORTANT: The token is stored in sessionStorage for security reasons.
 * It will be lost when the browser is closed, which is a security feature.
 * Users will need to re-enter their token when they return to the site.
 */

const GITHUB_CONFIG = {
    // Your GitHub username
    username: '',

    // Repository name where data will be stored
    repoName: '',

    // Enable GitHub API integration (set to false to use localStorage instead)
    enabled: true,

    // Securely get the token from sessionStorage
    getToken: function() {
        return sessionStorage.getItem('github_token');
    },

    // Securely save the token to sessionStorage
    setToken: function(token) {
        if (token) {
            sessionStorage.setItem('github_token', token);
            return true;
        }
        return false;
    },

    // Clear the token from sessionStorage
    clearToken: function() {
        sessionStorage.removeItem('github_token');
    }
};

// Export the configuration
window.GITHUB_CONFIG = GITHUB_CONFIG;