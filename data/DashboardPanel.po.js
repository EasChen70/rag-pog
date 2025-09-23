// DashboardPanel.js - Industry Standard Page Object
const { By } = require('selenium-webdriver');
const BasePanel = require('./BasePanel');

class DashboardPanel extends BasePanel {
    constructor(driver) {
        super(driver, 'Dashboard Panel', 'https://app.example.com/dashboard');
    }

    // Locators using consistent naming pattern
    get locators() {
        return {
            panel: By.css('[data-testid="dashboard-panel"]'),
            welcomeMessage: By.css('[data-testid="welcome-message"]'),
            statsContainer: By.css('[data-testid="stats-container"]'),
            recentActivity: By.css('[data-testid="recent-activity"]'),
            quickActions: By.css('[data-testid="quick-actions"]'),
            refreshButton: By.css('[data-testid="refresh-button"]'),
            settingsButton: By.css('[data-testid="settings-button"]'),
            logoutButton: By.css('[data-testid="logout-button"]'),
            loadingSpinner: By.css('[data-testid="loading-spinner"]'),
            errorMessage: By.css('[data-testid="error-message"]'),
            successMessage: By.css('[data-testid="success-message"]'),
            statItems: By.css('[data-testid*="stat-"]'),
            activityItems: By.css('[data-testid*="activity-item"]'),
            actionButtons: By.css('[data-testid*="action-button"]')
        };
    }

    // Required implementation of abstract method
    async waitForPageLoad() {
        try {
            await this.waitForElementVisible(this.locators.panel);
            await this.waitForElementVisible(this.locators.welcomeMessage);
            await this.waitForElementVisible(this.locators.statsContainer);
            await this.waitForElementInteractable(this.locators.refreshButton);
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
        } catch (error) {
            throw new Error(`${this.panelName} failed to load: ${error.message}`);
        }
    }

    // Interaction methods using base class utilities
    async clickRefreshButton() {
        await this.clickElement(this.locators.refreshButton, 'refresh button');
        await this.waitForRefreshOperation();
    }

    async clickSettingsButton() {
        await this.clickElement(this.locators.settingsButton, 'settings button');
    }

    async clickLogoutButton() {
        await this.clickElement(this.locators.logoutButton, 'logout button');
    }

    async getQuickActionButtons() {
        try {
            await this.waitForElementVisible(this.locators.quickActions);
            const container = await this.driver.findElement(this.locators.quickActions);
            return await container.findElements(this.locators.actionButtons);
        } catch (error) {
            throw new Error(`Failed to get quick action buttons: ${error.message}`);
        }
    }

    async clickQuickActionButton(buttonText) {
        try {
            const buttons = await this.getQuickActionButtons();
            
            for (const button of buttons) {
                const text = await button.getText();
                if (text.toLowerCase().includes(buttonText.toLowerCase())) {
                    await this.wait.until(until.elementIsEnabled(button));
                    await button.click();
                    return this.createResponse(true, `Quick action '${buttonText}' clicked successfully`);
                }
            }
            
            return this.createResponse(false, `Quick action button with text '${buttonText}' not found`);
            
        } catch (error) {
            throw new Error(`Failed to click quick action button '${buttonText}': ${error.message}`);
        }
    }

    // Validation methods using consistent pattern
    async getWelcomeMessage() {
        try {
            await this.waitForElementVisible(this.locators.welcomeMessage);
            const welcomeElement = await this.driver.findElement(this.locators.welcomeMessage);
            return await welcomeElement.getText();
        } catch (error) {
            throw new Error(`Failed to get welcome message: ${error.message}`);
        }
    }

    async getStatsData() {
        try {
            await this.waitForElementVisible(this.locators.statsContainer);
            const statsContainer = await this.driver.findElement(this.locators.statsContainer);
            const statElements = await statsContainer.findElements(this.locators.statItems);
            
            if (statElements.length === 0) {
                return {};
            }
            
            const stats = {};
            for (const element of statElements) {
                try {
                    await this.wait.until(until.elementIsVisible(element));
                    const id = await element.getAttribute('data-testid');
                    const value = await element.getText();
                    stats[id] = value;
                } catch (e) {
                    continue; // Skip elements that can't be read
                }
            }
            return stats;
            
        } catch (error) {
            throw new Error(`Failed to get stats data: ${error.message}`);
        }
    }

    async getRecentActivities() {
        try {
            await this.waitForElementVisible(this.locators.recentActivity);
            const activityContainer = await this.driver.findElement(this.locators.recentActivity);
            const activities = await activityContainer.findElements(this.locators.activityItems);
            
            const activityData = [];
            for (const activity of activities) {
                try {
                    await this.wait.until(until.elementIsVisible(activity));
                    const text = await activity.getText();
                    const timestamp = await activity.getAttribute('data-timestamp');
                    activityData.push({ text, timestamp });
                } catch (e) {
                    continue;
                }
            }
            return activityData;
            
        } catch (error) {
            throw new Error(`Failed to get recent activities: ${error.message}`);
        }
    }

    async getRecentActivityCount() {
        try {
            const activities = await this.getRecentActivities();
            return activities.length;
        } catch (error) {
            return 0;
        }
    }

    async getErrorMessage() {
        return await this.getMessage(this.locators.errorMessage);
    }

    async getSuccessMessage() {
        return await this.getMessage(this.locators.successMessage);
    }

    // Workflow methods with consistent response format
    async refreshDashboard() {
        try {
            await this.clickRefreshButton();
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
            
            // Check for errors
            const errorMsg = await this.getErrorMessage();
            if (errorMsg) {
                return this.createResponse(false, `Dashboard refresh failed: ${errorMsg}`);
            }
            
            // Check for success
            const successMsg = await this.getSuccessMessage();
            const message = successMsg || 'Dashboard refreshed successfully';
            
            return this.createResponse(true, message);
            
        } catch (error) {
            throw new Error(`Dashboard refresh workflow failed: ${error.message}`);
        }
    }

    async waitForRefreshOperation() {
        try {
            // Wait for loading to start (optional)
            try {
                await this.shortWait.until(until.elementLocated(this.locators.loadingSpinner));
            } catch (e) {
                // No loading spinner appeared, refresh might be instant
                return;
            }
            
            // Wait for refresh to complete
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
            
        } catch (error) {
            throw new Error(`Refresh operation timeout: ${error.message}`);
        }
    }

    async performLogout() {
        try {
            await this.clickLogoutButton();
            
            // Wait for redirect or logout confirmation
            await this.waitForCondition(
                async () => {
                    const currentUrl = await this.driver.getCurrentUrl();
                    return currentUrl.includes('/login') || currentUrl.includes('/logout');
                },
                this.timeouts.long,
                'Logout redirect did not occur'
            );
            
            const currentUrl = await this.driver.getCurrentUrl();
            const success = currentUrl.includes('/login') || currentUrl.includes('/logout');
            
            return this.createResponse(
                success,
                success ? 'Logout successful' : 'Logout may have failed',
                { redirectedTo: currentUrl }
            );
            
        } catch (error) {
            throw new Error(`Logout workflow failed: ${error.message}`);
        }
    }

    async validateAllElementsPresent() {
        const requiredElements = [
            { name: 'Welcome Message', locator: this.locators.welcomeMessage },
            { name: 'Stats Container', locator: this.locators.statsContainer },
            { name: 'Recent Activity', locator: this.locators.recentActivity },
            { name: 'Quick Actions', locator: this.locators.quickActions },
            { name: 'Refresh Button', locator: this.locators.refreshButton }
        ];

        return await this.validateRequiredElements(requiredElements);
    }
}

module.exports = DashboardPanel;