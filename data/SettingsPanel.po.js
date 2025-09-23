// SettingsPanel.js - Industry Standard Page Object
const { By } = require('selenium-webdriver');
const BasePanel = require('./BasePanel');

class SettingsPanel extends BasePanel {
    constructor(driver) {
        super(driver, 'Settings Panel', 'https://app.example.com/settings');
    }

    // Locators using consistent naming pattern
    get locators() {
        return {
            panel: By.css('[data-testid="settings-panel"]'),
            profileSection: By.css('[data-testid="profile-section"]'),
            nameInput: By.css('[data-testid="name-input"]'),
            emailInput: By.css('[data-testid="email-input"]'),
            phoneInput: By.css('[data-testid="phone-input"]'),
            saveButton: By.css('[data-testid="save-button"]'),
            cancelButton: By.css('[data-testid="cancel-button"]'),
            resetButton: By.css('[data-testid="reset-button"]'),
            notificationToggle: By.css('[data-testid="notification-toggle"]'),
            themeSelector: By.css('[data-testid="theme-selector"]'),
            languageSelector: By.css('[data-testid="language-selector"]'),
            successMessage: By.css('[data-testid="success-message"]'),
            errorMessage: By.css('[data-testid="error-message"]'),
            loadingSpinner: By.css('[data-testid="loading-spinner"]'),
            validationErrors: By.css('[data-testid*="validation-error"]')
        };
    }

    // Required implementation of abstract method
    async waitForPageLoad() {
        try {
            await this.waitForElementVisible(this.locators.panel);
            await this.waitForElementVisible(this.locators.profileSection);
            await this.waitForElementInteractable(this.locators.nameInput);
            await this.waitForElementInteractable(this.locators.emailInput);
            await this.waitForElementInteractable(this.locators.saveButton);
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
        } catch (error) {
            throw new Error(`${this.panelName} failed to load: ${error.message}`);
        }
    }

    // Form interaction methods using base class utilities
    async updateName(name) {
        await this.enterText(this.locators.nameInput, name);
    }

    async updateEmail(email) {
        // Basic email validation warning
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn(`Warning: Email '${email}' may not be valid format`);
        }
        await this.enterText(this.locators.emailInput, email);
    }

    async updatePhone(phone) {
        await this.enterText(this.locators.phoneInput, phone);
    }

    async clickSaveButton() {
        await this.clickElement(this.locators.saveButton, 'save button');
        await this.waitForSaveOperation();
    }

    async clickCancelButton() {
        await this.clickElement(this.locators.cancelButton, 'cancel button');
    }

    async clickResetButton() {
        await this.clickElement(this.locators.resetButton, 'reset button');
        await super.waitForLoadingToComplete(this.locators.loadingSpinner);
    }

    async toggleNotifications() {
        try {
            await this.waitForElementInteractable(this.locators.notificationToggle);
            const toggle = await this.driver.findElement(this.locators.notificationToggle);
            
            // Store current state for verification
            const initialState = await toggle.isSelected();
            await toggle.click();
            
            // Verify state changed
            const newState = await toggle.isSelected();
            if (initialState === newState) {
                throw new Error('Notification toggle state did not change');
            }
            
        } catch (error) {
            throw new Error(`Failed to toggle notifications: ${error.message}`);
        }
    }

    async selectTheme(themeName) {
        await this.selectFromDropdown(this.locators.themeSelector, themeName, 'theme selector');
    }

    async selectLanguage(languageName) {
        await this.selectFromDropdown(this.locators.languageSelector, languageName, 'language selector');
    }

    // Validation methods using consistent pattern
    async getCurrentName() {
        try {
            await this.waitForElementVisible(this.locators.nameInput);
            const nameField = await this.driver.findElement(this.locators.nameInput);
            return await nameField.getAttribute('value');
        } catch (error) {
            throw new Error(`Failed to get current name: ${error.message}`);
        }
    }

    async getCurrentEmail() {
        try {
            await this.waitForElementVisible(this.locators.emailInput);
            const emailField = await this.driver.findElement(this.locators.emailInput);
            return await emailField.getAttribute('value');
        } catch (error) {
            throw new Error(`Failed to get current email: ${error.message}`);
        }
    }

    async getCurrentPhone() {
        try {
            await this.waitForElementVisible(this.locators.phoneInput);
            const phoneField = await this.driver.findElement(this.locators.phoneInput);
            return await phoneField.getAttribute('value');
        } catch (error) {
            throw new Error(`Failed to get current phone: ${error.message}`);
        }
    }

    async isNotificationEnabled() {
        try {
            await this.waitForElementVisible(this.locators.notificationToggle);
            const toggle = await this.driver.findElement(this.locators.notificationToggle);
            return await toggle.isSelected();
        } catch (error) {
            return false;
        }
    }

    async getSelectedTheme() {
        try {
            await this.waitForElementVisible(this.locators.themeSelector);
            const themeSelector = await this.driver.findElement(this.locators.themeSelector);
            
            const Select = require('selenium-webdriver').Select;
            const select = new Select(themeSelector);
            const selectedOption = await select.getFirstSelectedOption();
            return await selectedOption.getText();
            
        } catch (error) {
            throw new Error(`Failed to get selected theme: ${error.message}`);
        }
    }

    async getSelectedLanguage() {
        try {
            await this.waitForElementVisible(this.locators.languageSelector);
            const languageSelector = await this.driver.findElement(this.locators.languageSelector);
            
            const Select = require('selenium-webdriver').Select;
            const select = new Select(languageSelector);
            const selectedOption = await select.getFirstSelectedOption();
            return await selectedOption.getText();
            
        } catch (error) {
            throw new Error(`Failed to get selected language: ${error.message}`);
        }
    }

    async getSuccessMessage() {
        return await this.getMessage(this.locators.successMessage);
    }

    async getErrorMessage() {
        return await this.getMessage(this.locators.errorMessage);
    }

    async getValidationErrors() {
        try {
            const errorElements = await this.driver.findElements(this.locators.validationErrors);
            const errors = [];
            
            for (const element of errorElements) {
                try {
                    const isVisible = await element.isDisplayed();
                    if (isVisible) {
                        const text = await element.getText();
                        const field = await element.getAttribute('data-field');
                        errors.push({ field, message: text });
                    }
                } catch (e) {
                    continue;
                }
            }
            
            return errors;
        } catch (error) {
            return [];
        }
    }

    // Workflow methods with consistent response format
    async updateProfile(profileData) {
        try {
            // Update fields if provided
            if (profileData.name) await this.updateName(profileData.name);
            if (profileData.email) await this.updateEmail(profileData.email);
            if (profileData.phone) await this.updatePhone(profileData.phone);
            
            // Handle preferences
            if (profileData.theme) await this.selectTheme(profileData.theme);
            if (profileData.language) await this.selectLanguage(profileData.language);
            if (typeof profileData.notifications === 'boolean') {
                const currentState = await this.isNotificationEnabled();
                if (currentState !== profileData.notifications) {
                    await this.toggleNotifications();
                }
            }
            
            // Save changes
            await this.clickSaveButton();
            
            // Wait for operation result
            await this.waitForSaveResult();
            
            // Check for validation errors first
            const validationErrors = await this.getValidationErrors();
            if (validationErrors.length > 0) {
                return this.createResponse(false, 'Validation errors occurred', { validationErrors });
            }
            
            // Check for general error
            const errorMsg = await this.getErrorMessage();
            if (errorMsg) {
                return this.createResponse(false, errorMsg);
            }
            
            // Check for success
            const successMsg = await this.getSuccessMessage();
            const message = successMsg || 'Profile updated successfully';
            
            return this.createResponse(true, message);
            
        } catch (error) {
            throw new Error(`Profile update workflow failed: ${error.message}`);
        }
    }

    async waitForSaveOperation() {
        try {
            // Wait for loading spinner to appear (save in progress)
            try {
                await this.shortWait.until(until.elementLocated(this.locators.loadingSpinner));
            } catch (e) {
                // No loading spinner, save might be instant
                return;
            }
            
            // Wait for save to complete
            await super.waitForLoadingToComplete(this.locators.loadingSpinner);
            
        } catch (error) {
            throw new Error(`Save operation timeout: ${error.message}`);
        }
    }

    async waitForSaveResult() {
        await this.waitForCondition(async () => {
            try {
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
                
                // Check for validation errors
                const validationElements = await this.driver.findElements(this.locators.validationErrors);
                for (const element of validationElements) {
                    if (await element.isDisplayed()) {
                        return true;
                    }
                }
                
                return false;
            } catch (e) {
                return false;
            }
        }, this.timeouts.long, 'Save result not received');
    }

    async resetToDefaults() {
        try {
            await this.updateName('Default User');
            await this.updateEmail('user@example.com');
            await this.updatePhone('555-0000');
            await this.selectTheme('light');
            await this.selectLanguage('English');
            
            // Reset notifications to default (enabled)
            const currentNotificationState = await this.isNotificationEnabled();
            if (!currentNotificationState) {
                await this.toggleNotifications();
            }
            
            await this.clickSaveButton();
            await this.waitForSaveResult();
            
            // Check for errors
            const errorMsg = await this.getErrorMessage();
            if (errorMsg) {
                return this.createResponse(false, `Reset failed: ${errorMsg}`);
            }
            
            return this.createResponse(true, 'Settings reset to defaults successfully');
            
        } catch (error) {
            throw new Error(`Reset workflow failed: ${error.message}`);
        }
    }

    async cancelChanges() {
        try {
            await this.clickCancelButton();
            
            // Wait for either page refresh or navigation
            await this.waitForCondition(
                async () => {
                    const currentUrl = await this.driver.getCurrentUrl();
                    return !currentUrl.includes('/settings') || await this.isFormReset();
                },
                this.timeouts.medium,
                'Cancel operation did not complete'
            );
            
            return this.createResponse(true, 'Changes cancelled successfully');
            
        } catch (error) {
            throw new Error(`Cancel workflow failed: ${error.message}`);
        }
    }

    async isFormReset() {
        try {
            // Check if save button is disabled (common pattern after cancel)
            const saveBtn = await this.driver.findElement(this.locators.saveButton);
            return !(await saveBtn.isEnabled());
        } catch (error) {
            return false;
        }
    }

    async validateAllElementsPresent() {
        const requiredElements = [
            { name: 'Profile Section', locator: this.locators.profileSection },
            { name: 'Name Input', locator: this.locators.nameInput },
            { name: 'Email Input', locator: this.locators.emailInput },
            { name: 'Save Button', locator: this.locators.saveButton },
            { name: 'Cancel Button', locator: this.locators.cancelButton },
            { name: 'Notification Toggle', locator: this.locators.notificationToggle }
        ];

        return await this.validateRequiredElements(requiredElements);
    }
}

module.exports = SettingsPanel;