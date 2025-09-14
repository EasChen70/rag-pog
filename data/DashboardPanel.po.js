// DashboardPanel.js - Page Object for Dashboard Panel
class DashboardPanel {
    constructor(driver) {
        this.driver = driver;
        this.panelName = 'Dashboard Panel';
        this.baseUrl = 'https://app.example.com/dashboard';
    }

    // Locators
    get selectors() {
        return {
            panel: '[data-testid="dashboard-panel"]',
            welcomeMessage: '[data-testid="welcome-message"]',
            statsContainer: '[data-testid="stats-container"]',
            recentActivity: '[data-testid="recent-activity"]',
            quickActions: '[data-testid="quick-actions"]',
            refreshButton: '[data-testid="refresh-button"]',
            settingsButton: '[data-testid="settings-button"]',
            logoutButton: '[data-testid="logout-button"]',
            loadingSpinner: '[data-testid="loading-spinner"]'
        };
    }

    // Navigation methods
    async navigateToPanel() {
        await this.driver.get(this.baseUrl);
        await this.waitForPanelLoad();
    }

    async waitForPanelLoad() {
        await this.driver.wait(this.driver.findElement(this.selectors.panel), 10000);
    }

    // Interaction methods
    async clickRefreshButton() {
        const refreshBtn = await this.driver.findElement(this.selectors.refreshButton);
        await refreshBtn.click();
    }

    async clickSettingsButton() {
        const settingsBtn = await this.driver.findElement(this.selectors.settingsButton);
        await settingsBtn.click();
    }

    async clickLogoutButton() {
        const logoutBtn = await this.driver.findElement(this.selectors.logoutButton);
        await logoutBtn.click();
    }

    async getQuickActionButtons() {
        const container = await this.driver.findElement(this.selectors.quickActions);
        return await container.findElements('[data-testid*="action-button"]');
    }

    // Validation methods
    async getWelcomeMessage() {
        const welcomeElement = await this.driver.findElement(this.selectors.welcomeMessage);
        return await welcomeElement.getText();
    }

    async getStatsData() {
        try {
            const statsContainer = await this.driver.findElement(this.selectors.statsContainer);
            const statElements = await statsContainer.findElements('[data-testid*="stat-"]');
            
            const stats = {};
            for (const element of statElements) {
                const id = await element.getAttribute('data-testid');
                const value = await element.getText();
                stats[id] = value;
            }
            return stats;
        } catch (e) {
            return {};
        }
    }

    async isLoadingVisible() {
        try {
            const spinner = await this.driver.findElement(this.selectors.loadingSpinner);
            return await spinner.isDisplayed();
        } catch (e) {
            return false;
        }
    }

    async getRecentActivityCount() {
        try {
            const activityContainer = await this.driver.findElement(this.selectors.recentActivity);
            const activities = await activityContainer.findElements('[data-testid*="activity-item"]');
            return activities.length;
        } catch (e) {
            return 0;
        }
    }

    // Workflow methods
    async refreshDashboard() {
        await this.clickRefreshButton();
        await this.driver.sleep(1000);
        
        // Wait for loading to complete
        while (await this.isLoadingVisible()) {
            await this.driver.sleep(500);
        }
    }

    async validatePanelElements() {
        const elements = [
            this.selectors.welcomeMessage,
            this.selectors.statsContainer,
            this.selectors.recentActivity,
            this.selectors.quickActions,
            this.selectors.refreshButton
        ];

        for (const selector of elements) {
            const element = await this.driver.findElement(selector);
            if (!await element.isDisplayed()) {
                throw new Error(`Element ${selector} is not visible in ${this.panelName}`);
            }
        }
    }

    async performLogout() {
        await this.clickLogoutButton();
        
        // Wait for redirect to login page
        await this.driver.sleep(2000);
        const currentUrl = await this.driver.getCurrentUrl();
        return currentUrl.includes('/login');
    }
}

module.exports = DashboardPanel;