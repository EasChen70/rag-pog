// LoginPanel.js - Page Object for Login Panel
class LoginPanel {
    constructor(driver) {
        this.driver = driver;
        this.panelName = 'Login Panel';
        this.baseUrl = 'https://app.example.com/login';
    }

    // Locators
    get selectors() {
        return {
            panel: '[data-testid="login-panel"]',
            emailInput: '[data-testid="email-input"]',
            passwordInput: '[data-testid="password-input"]',
            loginButton: '[data-testid="login-button"]',
            forgotPasswordLink: '[data-testid="forgot-password-link"]',
            errorMessage: '[data-testid="error-message"]',
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
    async enterEmail(email) {
        const emailField = await this.driver.findElement(this.selectors.emailInput);
        await emailField.clear();
        await emailField.sendKeys(email);
    }

    async enterPassword(password) {
        const passwordField = await this.driver.findElement(this.selectors.passwordInput);
        await passwordField.clear();
        await passwordField.sendKeys(password);
    }

    async clickLoginButton() {
        const loginBtn = await this.driver.findElement(this.selectors.loginButton);
        await loginBtn.click();
    }

    async clickForgotPassword() {
        const forgotLink = await this.driver.findElement(this.selectors.forgotPasswordLink);
        await forgotLink.click();
    }

    // Validation methods
    async isLoginButtonEnabled() {
        const loginBtn = await this.driver.findElement(this.selectors.loginButton);
        return await loginBtn.isEnabled();
    }

    async getErrorMessage() {
        try {
            const errorElement = await this.driver.findElement(this.selectors.errorMessage);
            return await errorElement.getText();
        } catch (e) {
            return null;
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

    // Workflow methods
    async performLogin(email, password) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickLoginButton();
        
        // Wait for either success redirect or error message
        await this.driver.sleep(2000);
    }

    async validatePanelElements() {
        const elements = [
            this.selectors.emailInput,
            this.selectors.passwordInput,
            this.selectors.loginButton,
            this.selectors.forgotPasswordLink
        ];

        for (const selector of elements) {
            const element = await this.driver.findElement(selector);
            if (!await element.isDisplayed()) {
                throw new Error(`Element ${selector} is not visible in ${this.panelName}`);
            }
        }
    }
}

module.exports = LoginPanel;