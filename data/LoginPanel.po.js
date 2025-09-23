// LoginPanel.js - Industry Standard Page Object
const { By } = require('selenium-webdriver');
const BasePanel = require('./BasePanel');

class LoginPanel extends BasePanel {
    constructor(driver) {
        super(driver, 'Login Panel', 'https://app.example.com/login');
    }

    // Locators using consistent naming pattern
    get locators() {
        return {
            panel: By.css('[data-testid="login-panel"]'),
            emailInput: By.css('[data-testid="email-input"]'),
            passwordInput: By.css('[data-testid="password-input"]'),
            loginButton: By.css('[data-testid="login-button"]'),
            forgotPasswordLink: By.css('[data-testid="forgot-password-link"]'),
            errorMessage: By.css('[data-testid="error-message"]'),
            loadingSpinner: By.css('[data-testid="loading-spinner"]'),
            successMessage: By.css('[data-testid="success-message"]')
        };
    }

    // Required implementation of abstract method
    async waitForPageLoad() {
        try {
            await this.waitForElementVisible(this.locators.panel);
            await this.waitForElementInteractable(this.locators.emailInput);
            await this.waitForElementInteractable(this.locators.passwordInput);
            await this.waitForElementInteractable(this.locators.loginButton);
        } catch (error) {
            throw new Error(`${this.panelName} failed to load: ${error.message}`);
        }
    }

    // Form interaction methods using base class utilities
    async enterEmail(email) {
        await this.enterText(this.locators.emailInput, email);
    }

    async enterPassword(password) {
        await this.enterText(this.locators.passwordInput, password, false); // Don't verify password for security
    }

    async clickLoginButton() {
        await this.clickElement(this.locators.loginButton, 'login button');
    }

    async clickForgotPassword() {
        await this.clickElement(this.locators.forgotPasswordLink, 'forgot password link');
    }

    // Validation methods using consistent pattern
    async isLoginButtonEnabled() {
        try {
            await this.waitForElementVisible(this.locators.loginButton);
            const loginBtn = await this.driver.findElement(this.locators.loginButton);
            return await loginBtn.isEnabled();
        } catch (error) {
            return false;
        }
    }

    async getErrorMessage() {
        return await this.getMessage(this.locators.errorMessage);
    }

    async getSuccessMessage() {
        return await this.getMessage(this.locators.successMessage);
    }

    // Workflow methods with consistent response format
    async performLogin(email, password) {
        try {
            await this.enterEmail(email);
            await this.enterPassword(password);
            await this.clickLoginButton();
            
            // Wait for login result
            await this.waitForLoginResult();
            
            // Check for error first
            const errorMsg = await this.getErrorMessage();
            if (errorMsg) {
                return this.createResponse(false, errorMsg);
            }
            
            // Check for successful redirect
            const currentUrl = await this.driver.getCurrentUrl();
            if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
                return this.createResponse(true, 'Login successful', { redirectedTo: currentUrl });
            }
            
            // Check for success message without redirect
            const successMsg = await this.getSuccessMessage();
            if (successMsg) {
                return this.createResponse(true, successMsg, { redirectedTo: currentUrl });
            }
            
            return this.createResponse(false, 'Login result unclear', { redirectedTo: currentUrl });
            
        } catch (error) {
            throw new Error(`Login workflow failed: ${error.message}`);
        }
    }

    async waitForLoginResult() {
        await this.waitForCondition(async () => {
            try {
                // Check for error message
                const errorExists = await this.driver.findElements(this.locators.errorMessage);
                if (errorExists.length > 0 && await errorExists[0].isDisplayed()) {
                    return true;
                }
                
                // Check for URL change
                const currentUrl = await this.driver.getCurrentUrl();
                if (!currentUrl.includes('/login')) {
                    return true;
                }
                
                // Check for success message
                const successExists = await this.driver.findElements(this.locators.successMessage);
                if (successExists.length > 0 && await successExists[0].isDisplayed()) {
                    return true;
                }
                
                return false;
            } catch (e) {
                return false;
            }
        }, this.timeouts.long, 'Login result not received');
    }

    async validateAllElementsPresent() {
        const requiredElements = [
            { name: 'Email Input', locator: this.locators.emailInput },
            { name: 'Password Input', locator: this.locators.passwordInput },
            { name: 'Login Button', locator: this.locators.loginButton },
            { name: 'Forgot Password Link', locator: this.locators.forgotPasswordLink }
        ];

        return await this.validateRequiredElements(requiredElements);
    }
}

module.exports = LoginPanel;