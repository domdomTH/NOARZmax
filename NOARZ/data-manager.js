/**
 * Data Manager for NOARZ
 * This file provides a unified interface for data storage,
 * supporting both GitHub API and localStorage
 */

class DataManager {
    constructor() {
        this.githubApi = null;
        this.isInitialized = false;
        this.useGitHub = false;
        this.initPromise = null;
    }

    /**
     * Initialize the data manager
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
        // Prevent multiple initializations
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve) => {
            try {
                // Check if GitHub API is enabled in config
                if (window.GITHUB_CONFIG && window.GITHUB_CONFIG.enabled) {
                    const { username, repoName } = window.GITHUB_CONFIG;
                    const token = window.GITHUB_CONFIG.getToken();

                    if (username && repoName && token) {
                        this.githubApi = new window.GitHubAPI(token);
                        const success = await this.githubApi.initialize(username, repoName);

                        if (success) {
                            console.log('Using GitHub API for data storage');
                            this.useGitHub = true;
                            this.isInitialized = true;
                            resolve(true);
                            return;
                        } else {
                            console.warn('Failed to initialize GitHub API, falling back to localStorage');
                        }
                    } else {
                        console.warn('GitHub API configuration is incomplete, falling back to localStorage');
                    }
                }

                // Fallback to localStorage
                console.log('Using localStorage for data storage');
                this.useGitHub = false;
                this.isInitialized = true;
                resolve(true);
            } catch (error) {
                console.error('Error initializing data manager:', error);
                this.useGitHub = false;
                this.isInitialized = true;
                resolve(false);
            }
        });

        return this.initPromise;
    }

    /**
     * Ensure the data manager is initialized
     * @private
     */
    async _ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Get news items
     * @returns {Promise<Array>} - Array of news items
     */
    async getNewsItems() {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.getNewsItems();
        } else {
            // Fallback to localStorage
            const newsItems = JSON.parse(localStorage.getItem('jjkNews'));
            if (!newsItems) {
                // Create sample data if none exists
                return this._createSampleNewsData();
            }
            return newsItems;
        }
    }

    /**
     * Save news items
     * @param {Array} newsItems - Array of news items
     * @returns {Promise<boolean>} - Success status
     */
    async saveNewsItems(newsItems) {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.saveNewsItems(newsItems);
        } else {
            // Fallback to localStorage
            localStorage.setItem('jjkNews', JSON.stringify(newsItems));
            return true;
        }
    }

    /**
     * Get site settings
     * @returns {Promise<Object>} - Site settings
     */
    async getSiteSettings() {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.getSiteSettings();
        } else {
            // Fallback to localStorage
            return {
                siteTitle: localStorage.getItem('jjkSiteTitle') || 'NOARZ',
                newsHeader: localStorage.getItem('jjkNewsHeader') || '📰MESSAGE📣'
            };
        }
    }

    /**
     * Save site settings
     * @param {Object} settings - Site settings
     * @returns {Promise<boolean>} - Success status
     */
    async saveSiteSettings(settings) {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.saveSiteSettings(settings);
        } else {
            // Fallback to localStorage
            localStorage.setItem('jjkSiteTitle', settings.siteTitle);
            localStorage.setItem('jjkNewsHeader', settings.newsHeader);
            return true;
        }
    }

    /**
     * Get social media links
     * @returns {Promise<Object>} - Social media links
     */
    async getSocialLinks() {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.getSocialLinks();
        } else {
            // Fallback to localStorage
            const socialLinks = JSON.parse(localStorage.getItem('jjkSocialLinks')) || {
                youtube: 'https://www.youtube.com',
                discord: 'https://discord.com'
            };
            return socialLinks;
        }
    }

    /**
     * Save social media links
     * @param {Object} links - Social media links
     * @returns {Promise<boolean>} - Success status
     */
    async saveSocialLinks(links) {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.saveSocialLinks(links);
        } else {
            // Fallback to localStorage
            localStorage.setItem('jjkSocialLinks', JSON.stringify(links));
            return true;
        }
    }

    /**
     * Get admin settings
     * @returns {Promise<Object>} - Admin settings
     */
    async getAdminSettings() {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.getAdminSettings();
        } else {
            // Fallback to localStorage
            return {
                adminCode: localStorage.getItem('jjkAdminCode') || '0988131688'
            };
        }
    }

    /**
     * Save admin settings
     * @param {Object} settings - Admin settings
     * @returns {Promise<boolean>} - Success status
     */
    async saveAdminSettings(settings) {
        await this._ensureInitialized();

        if (this.useGitHub) {
            return await this.githubApi.saveAdminSettings(settings);
        } else {
            // Fallback to localStorage
            localStorage.setItem('jjkAdminCode', settings.adminCode);
            return true;
        }
    }

    /**
     * Create sample news data
     * @private
     * @returns {Array} - Sample news items
     */
    _createSampleNewsData() {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        return [
            {
                id: '1',
                title: 'Welcome to NOARZ',
                category: 'roblox-script',
                content: 'Welcome to our news platform! This is a sample post to show how the system works.',
                coverImageUrl: 'https://i.imgur.com/IuN9n69.jpg',
                galleryImages: [
                    'https://i.imgur.com/IuN9n69.jpg',
                    'https://i.imgur.com/jCgYAFB.jpg'
                ],
                date: now.toISOString(),
                edited: null
            },
            {
                id: '2',
                title: 'New Features Coming Soon',
                category: 'runner',
                content: 'We are working on exciting new features for our platform. Stay tuned for updates!',
                coverImageUrl: 'https://i.imgur.com/jCgYAFB.jpg',
                galleryImages: [
                    'https://i.imgur.com/jCgYAFB.jpg',
                    'https://i.imgur.com/UKQEMkT.jpg'
                ],
                date: yesterday.toISOString(),
                edited: null
            },
            {
                id: '3',
                title: 'How to Use the Admin Panel',
                category: 'roblox-script',
                content: 'This guide explains how to use the admin panel to manage your news posts.',
                coverImageUrl: 'https://i.imgur.com/UKQEMkT.jpg',
                galleryImages: [
                    'https://i.imgur.com/IuN9n69.jpg',
                    'https://i.imgur.com/jCgYAFB.jpg',
                    'https://i.imgur.com/UKQEMkT.jpg',
                    'https://i.imgur.com/YTKM8bR.jpg'
                ],
                date: twoDaysAgo.toISOString(),
                edited: null
            }
        ];
    }
}

// Create a global instance of the DataManager
window.dataManager = new DataManager();
