// SettingsPanel.js - Page Object for Settings Panel
class SettingsPanel {
    constructor(driver) {
        this.driver = driver;
        this.panelName = 'Settings Panel';
        this.baseUrl = 'https://app.example.com/settings';
    }

    // Locators
    get selectors() {
        return {
            panel: '[data-testid="settings-panel"]',
            profileSection: '[data-testid="profile-section"]',
            nameInput: '[data-testid="name-input"]',
            emailInput: '[data-testid="email-input"]',
            phoneInput: '[data-testid="phone-input"]',
            saveButton: '[data-testid="save-button"]',
            cancelButton: '[data-testid="cancel-button"]',
            notificationToggle: '[data-testid="notification-toggle"]',
            themeSelector: '[data-testid="theme-selector"]',
            successMessage: '[data-testid="success-message"]',
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
    async updateName(name) {
        const nameField = await this.driver.findElement(this.selectors.nameInput);
        await nameField.clear();
        await nameField.sendKeys(name);
    }

    async updateEmail(email) {
        const emailField = await this.driver.findElement(this.selectors.emailInput);
        await emailField.clear();
        await emailField.sendKeys(email);
    }

    async updatePhone(phone) {
        const phoneField = await this.driver.findElement(this.selectors.phoneInput);
        await phoneField.clear();
        await phoneField.sendKeys(phone);
    }

    async clickSaveButton() {
        const saveBtn = await this.driver.findElement(this.selectors.saveButton);
        await saveBtn.click();
    }

    async clickCancelButton() {
        const cancelBtn = await this.driver.findElement(this.selectors.cancelButton);
        await cancelBtn.click();
    }

    async toggleNotifications() {
        const toggle = await this.driver.findElement(this.selectors.notificationToggle);
        await toggle.click();
    }

    async selectTheme(theme) {
        const themeSelector = await this.driver.findElement(this.selectors.themeSelector);
        await themeSelector.sendKeys(theme);
    }

    // Validation methods
    async getCurrentName() {
        const nameField = await this.driver.findElement(this.selectors.nameInput);
        return await nameField.getAttribute('value');
    }

    async getCurrentEmail() {
        const emailField = await this.driver.findElement(this.selectors.emailInput);
        return await emailField.getAttribute('value');
    }

    async getCurrentPhone() {
        const phoneField = await this.driver.findElement(this.selectors.phoneInput);
        return await phoneField.getAttribute('value');
    }

    async isNotificationEnabled() {
        const toggle = await this.driver.findElement(this.selectors.notificationToggle);
        return await toggle.isSelected();
    }

    async getSelectedTheme() {
        const themeSelector = await this.driver.findElement(this.selectors.themeSelector);
        return await themeSelector.getAttribute('value');
    }

    async getSuccessMessage() {
        try {
            const successElement = await this.driver.findElement(this.selectors.successMessage);
            return await successElement.getText();
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
    async updateProfile(profileData) {
        if (profileData.name) await this.updateName(profileData.name);
        if (profileData.email) await this.updateEmail(profileData.email);
        if (profileData.phone) await this.updatePhone(profileData.phone);
        
        await this.clickSaveButton();
        
        // Wait for save operation
        await this.driver.sleep(1000);
        while (await this.isLoadingVisible()) {
            await this.driver.sleep(500);
        }
        
        return await this.getSuccessMessage();
    }

    async validatePanelElements() {
        const elements = [
            this.selectors.profileSection,
            this.selectors.nameInput,
            this.selectors.emailInput,
            this.selectors.saveButton,
            this.selectors.cancelButton,
            this.selectors.notificationToggle
        ];

        for (const selector of elements) {
            const element = await this.driver.findElement(selector);
            if (!await element.isDisplayed()) {
                throw new Error(`Element ${selector} is not visible in ${this.panelName}`);
            }
        }
    }

    async resetToDefaults() {
        await this.updateName('Default User');
        await this.updateEmail('user@example.com');
        await this.updatePhone('555-0000');
        await this.selectTheme('light');
        await this.clickSaveButton();
        
        // Wait for reset to complete
        await this.driver.sleep(2000);
    }
}

module.exports = SettingsPanel;