/**
 * GitHub API Integration for NOARZ Admin Backend
 * This file handles all interactions with the GitHub API for data storage
 */

class GitHubAPI {
    constructor(token) {
        this.token = token;
        this.apiBaseUrl = 'https://api.github.com';
        this.username = null;
        this.repoName = null;
    }

    /**
     * Initialize the GitHub API with user credentials
     * @param {string} username - GitHub username
     * @param {string} repoName - Repository name for data storage
     * @returns {Promise<boolean>} - Success status
     */
    async initialize(username, repoName) {
        this.username = username;
        this.repoName = repoName;

        try {
            // Test the connection and authentication
            await this.makeRequest(`/repos/${username}/${repoName}`);
            console.log('GitHub API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize GitHub API:', error);
            return false;
        }
    }

    /**
     * Make an authenticated request to the GitHub API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request data
     * @returns {Promise<Object>} - Response data
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        const options = {
            method,
            headers,
            mode: 'cors',
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        // For HEAD requests or other requests without response body
        if (method === 'HEAD' || response.status === 204) {
            return { status: response.status, ok: response.ok };
        }

        return await response.json();
    }

    /**
     * Get file content from the repository
     * @param {string} path - File path in the repository
     * @returns {Promise<Object>} - File content and metadata
     */
    async getFile(path) {
        try {
            const endpoint = `/repos/${this.username}/${this.repoName}/contents/${path}`;
            const response = await this.makeRequest(endpoint);

            // GitHub API returns content as base64 encoded
            const content = atob(response.content);
            return {
                content,
                sha: response.sha,
                path: response.path
            };
        } catch (error) {
            if (error.message.includes('404')) {
                // File doesn't exist yet
                return null;
            }
            throw error;
        }
    }

    /**
     * Create or update a file in the repository
     * @param {string} path - File path in the repository
     * @param {string} content - File content
     * @param {string} message - Commit message
     * @param {string} sha - File SHA (required for updates)
     * @returns {Promise<Object>} - Response data
     */
    async saveFile(path, content, message) {
        // First check if file exists to get its SHA
        const existingFile = await this.getFile(path);
        const sha = existingFile ? existingFile.sha : null;

        const endpoint = `/repos/${this.username}/${this.repoName}/contents/${path}`;
        const data = {
            message,
            content: btoa(content), // Base64 encode the content
            branch: 'main' // or your default branch
        };

        if (sha) {
            data.sha = sha; // Required for updating existing files
        }

        return await this.makeRequest(endpoint, 'PUT', data);
    }

    /**
     * Delete a file from the repository
     * @param {string} path - File path in the repository
     * @param {string} message - Commit message
     * @returns {Promise<Object>} - Response data
     */
    async deleteFile(path, message) {
        const existingFile = await this.getFile(path);

        if (!existingFile) {
            throw new Error(`File not found: ${path}`);
        }

        const endpoint = `/repos/${this.username}/${this.repoName}/contents/${path}`;
        const data = {
            message,
            sha: existingFile.sha,
            branch: 'main' // or your default branch
        };

        return await this.makeRequest(endpoint, 'DELETE', data);
    }

    /**
     * Get news items from the repository
     * @returns {Promise<Array>} - Array of news items
     */
    async getNewsItems() {
        try {
            const file = await this.getFile('news.json');
            return file ? JSON.parse(file.content) : [];
        } catch (error) {
            console.error('Error getting news items:', error);
            return [];
        }
    }

    /**
     * Save news items to the repository
     * @param {Array} newsItems - Array of news items
     * @returns {Promise<boolean>} - Success status
     */
    async saveNewsItems(newsItems) {
        try {
            await this.saveFile(
                'news.json',
                JSON.stringify(newsItems, null, 2),
                'Update news items'
            );
            return true;
        } catch (error) {
            console.error('Error saving news items:', error);
            return false;
        }
    }

    /**
     * Get site settings from the repository
     * @returns {Promise<Object>} - Site settings
     */
    async getSiteSettings() {
        try {
            const file = await this.getFile('settings.json');
            return file ? JSON.parse(file.content) : {};
        } catch (error) {
            console.error('Error getting site settings:', error);
            return {};
        }
    }

    /**
     * Save site settings to the repository
     * @param {Object} settings - Site settings
     * @returns {Promise<boolean>} - Success status
     */
    async saveSiteSettings(settings) {
        try {
            await this.saveFile(
                'settings.json',
                JSON.stringify(settings, null, 2),
                'Update site settings'
            );
            return true;
        } catch (error) {
            console.error('Error saving site settings:', error);
            return false;
        }
    }

    /**
     * Get social media links from the repository
     * @returns {Promise<Object>} - Social media links
     */
    async getSocialLinks() {
        try {
            const file = await this.getFile('social.json');
            return file ? JSON.parse(file.content) : {
                youtube: 'https://www.youtube.com',
                discord: 'https://discord.com'
            };
        } catch (error) {
            console.error('Error getting social links:', error);
            return {
                youtube: 'https://www.youtube.com',
                discord: 'https://discord.com'
            };
        }
    }

    /**
     * Save social media links to the repository
     * @param {Object} links - Social media links
     * @returns {Promise<boolean>} - Success status
     */
    async saveSocialLinks(links) {
        try {
            await this.saveFile(
                'social.json',
                JSON.stringify(links, null, 2),
                'Update social media links'
            );
            return true;
        } catch (error) {
            console.error('Error saving social links:', error);
            return false;
        }
    }

    /**
     * Get admin settings from the repository
     * @returns {Promise<Object>} - Admin settings
     */
    async getAdminSettings() {
        try {
            const file = await this.getFile('admin.json');
            return file ? JSON.parse(file.content) : {
                adminCode: "0988131688" // Default admin code
            };
        } catch (error) {
            console.error('Error getting admin settings:', error);
            return {
                adminCode: "0988131688" // Default admin code
            };
        }
    }

    /**
     * Save admin settings to the repository
     * @param {Object} settings - Admin settings
     * @returns {Promise<boolean>} - Success status
     */
    async saveAdminSettings(settings) {
        try {
            await this.saveFile(
                'admin.json',
                JSON.stringify(settings, null, 2),
                'Update admin settings'
            );
            return true;
        } catch (error) {
            console.error('Error saving admin settings:', error);
            return false;
        }
    }
}

// Export the GitHubAPI class
window.GitHubAPI = GitHubAPI;
