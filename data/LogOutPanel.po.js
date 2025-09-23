// LogOutPanel.js - Industry Standard Page Object
const { By } = require('selenium-webdriver');
const BasePanel = require('./BasePanel');

class LogOutPanel extends BasePanel {
    constructor(driver) {
        super(driver, 'Log Out Panel', 'https://app.example.com/logout');
    }

    // Locators using consistent naming pattern
    get locators() {
        return {
            panel: By.css('[data-testid="logout-panel"]'),
            confirmLogoutButton: By.css('[data-testid="confirm-logout-button"]'),
            cancelLogoutButton: By.css('[data-testid="cancel-logout-button"]'),
            logoutMessage: By.css('[data-testid="logout-message"]'),
            userInfoSection: By.css('[data-testid="user-info-section"]'),
            userName: By.css('[data-testid="user-name"]'),
            lastLoginInfo: By.css('[data-testid="last-login-info"]'),
            sessionTimeInfo: By.css('[data-testid="session-time-info"]'),
            loadingSpinner: By.css('[data-testid="loading-spinner"]'),
            errorMessage: By.css('[data-testid="error-message"]'),
            successMessage: By.css('[data-testid="success-message"]')
        };
    }

    // Required implementation of abstract method
    async waitForPageLoad() {
        try {
            await this.waitForElementVisible(this.locators.panel);
            await this.waitForElementVisible(this.locators.logoutMessage);
            await this.waitForElementInteractable(this.locators.confirmLogoutButton);
            await this.waitForElementInteractable(this.locators.cancelLogoutButton);
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
        } catch (error) {
            throw new Error(`${this.panelName} failed to load: ${error.message}`);
        }
    }

    // Interaction methods using base class utilities
    async clickConfirmLogout() {
        await this.clickElement(this.locators.confirmLogoutButton, 'confirm logout button');
        await this.waitForLogoutProcess();
    }

    async clickCancelLogout() {
        await this.clickElement(this.locators.cancelLogoutButton, 'cancel logout button');
    }

    // Validation methods using consistent pattern
    async getLogoutMessage() {
        try {
            await this.waitForElementVisible(this.locators.logoutMessage);
            const messageElement = await this.driver.findElement(this.locators.logoutMessage);
            return await messageElement.getText();
        } catch (error) {
            throw new Error(`Failed to get logout message: ${error.message}`);
        }
    }

    async getUserInfo() {
        try {
            const userInfo = {};
            
            // Get user name if available
            try {
                await this.waitForElementVisible(this.locators.userName, this.timeouts.short);
                const userNameElement = await this.driver.findElement(this.locators.userName);
                userInfo.userName = await userNameElement.getText();
            } catch (e) {
                userInfo.userName = null;
            }
            
            // Get last login info if available
            try {
                await this.waitForElementVisible(this.locators.lastLoginInfo, this.timeouts.short);
                const lastLoginElement = await this.driver.findElement(this.locators.lastLoginInfo);
                userInfo.lastLogin = await lastLoginElement.getText();
            } catch (e) {
                userInfo.lastLogin = null;
            }
            
            // Get session time if available
            try {
                await this.waitForElementVisible(this.locators.sessionTimeInfo, this.timeouts.short);
                const sessionTimeElement = await this.driver.findElement(this.locators.sessionTimeInfo);
                userInfo.sessionTime = await sessionTimeElement.getText();
            } catch (e) {
                userInfo.sessionTime = null;
            }
            
            return userInfo;
            
        } catch (error) {
            throw new Error(`Failed to get user info: ${error.message}`);
        }
    }

    async getErrorMessage() {
        return await this.getMessage(this.locators.errorMessage);
    }

    async getSuccessMessage() {
        return await this.getMessage(this.locators.successMessage);
    }

    async isConfirmButtonEnabled() {
        try {
            await this.waitForElementVisible(this.locators.confirmLogoutButton);
            const confirmBtn = await this.driver.findElement(this.locators.confirmLogoutButton);
            return await confirmBtn.isEnabled();
        } catch (error) {
            return false;
        }
    }

    async isCancelButtonEnabled() {
        try {
            await this.waitForElementVisible(this.locators.cancelLogoutButton);
            const cancelBtn = await this.driver.findElement(this.locators.cancelLogoutButton);
            return await cancelBtn.isEnabled();
        } catch (error) {
            return false;
        }
    }

    // Workflow methods with consistent response format
    async performLogout() {
        try {
            // Get user info before logout for verification
            const userInfo = await this.getUserInfo();
            
            // Click confirm logout
            await this.clickConfirmLogout();
            
            // Wait for logout result
            await this.waitForLogoutResult();
            
            // Check for errors first
            const errorMsg = await this.getErrorMessage();
            if (errorMsg) {
                return this.createResponse(false, errorMsg, { userInfo });
            }
            
            // Check for successful redirect to login
            const currentUrl = await this.driver.getCurrentUrl();
            const isRedirectedToLogin = currentUrl.includes('/login') || 
                                       currentUrl.includes('/auth') ||
                                       currentUrl.includes('/signin');
            
            if (isRedirectedToLogin) {
                return this.createResponse(
                    true, 
                    'Logout successful - redirected to login',
                    { redirectedTo: currentUrl, userInfo }
                );
            }
            
            // Check for success message without redirect
            const successMsg = await this.getSuccessMessage();
            if (successMsg) {
                return this.createResponse(
                    true,
                    successMsg,
                    { redirectedTo: currentUrl, userInfo }
                );
            }
            
            return this.createResponse(
                false,
                'Logout result unclear - no redirect or success message',
                { redirectedTo: currentUrl, userInfo }
            );
            
        } catch (error) {
            throw new Error(`Logout workflow failed: ${error.message}`);
        }
    }

    async cancelLogout() {
        try {
            const originalUrl = await this.driver.getCurrentUrl();
            
            await this.clickCancelLogout();
            
            // Wait for either redirect or page state change
            await this.waitForCondition(
                async () => {
                    const currentUrl = await this.driver.getCurrentUrl();
                    
                    // Check if we're back to the previous page
                    if (!currentUrl.includes('/logout')) {
                        return true;
                    }
                    
                    // Or if logout buttons are disabled (cancelled state)
                    const confirmEnabled = await this.isConfirmButtonEnabled();
                    const cancelEnabled = await this.isCancelButtonEnabled();
                    
                    return !confirmEnabled && !cancelEnabled;
                },
                this.timeouts.medium,
                'Cancel logout operation did not complete'
            );
            
            const currentUrl = await this.driver.getCurrentUrl();
            return this.createResponse(
                true,
                'Logout cancelled successfully',
                { redirectedTo: currentUrl, originalUrl }
            );
            
        } catch (error) {
            throw new Error(`Cancel logout workflow failed: ${error.message}`);
        }
    }

    async waitForLogoutProcess() {
        try {
            // Wait for loading spinner to appear (logout in progress)
            try {
                await this.shortWait.until(until.elementLocated(this.locators.loadingSpinner));
            } catch (e) {
                // No loading spinner, logout might be instant
                return;
            }
            
            // Wait for logout process to complete
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
            
        } catch (error) {
            throw new Error(`Logout process timeout: ${error.message}`);
        }
    }

    async waitForLogoutResult() {
        await this.waitForCondition(async () => {
            try {
                // Check for URL change (redirect)
                const currentUrl = await this.driver.getCurrentUrl();
                if (!currentUrl.includes('/logout')) {
                    return true;
                }
                
                // Check for success message
                const successElements = await this.driver.findElements(this.locators.successMessage);
                if (successElements.length > 0 && await successElements[0].isDisplayed()) {
                    return true;
                }
                
                // Check for error message
                const errorElements = await this.driver.findElements(this.locators.errorMessage);
                if (errorElements.length > 0 && await errorElements[0].isDisplayed()) {
                    return true;
                }
                
                return false;
            } catch (e) {
                return false;
            }
        }, this.timeouts.long, 'Logout result not received');
    }

    async validateAllElementsPresent() {
        const requiredElements = [
            { name: 'Logout Message', locator: this.locators.logoutMessage },
            { name: 'Confirm Logout Button', locator: this.locators.confirmLogoutButton },
            { name: 'Cancel Logout Button', locator: this.locators.cancelLogoutButton }
        ];

        return await this.validateRequiredElements(requiredElements);
    }
}

module.exports = LogOutPanel;