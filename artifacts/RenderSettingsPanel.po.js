// RenderSettingsPanel.js - Page Object for Render Settings Panel
const { By, until, Select } = require('selenium-webdriver');
const BasePanel = require('./BasePanel');

class RenderSettingsPanel extends BasePanel {
    constructor(driver) {
        super(driver, 'Render Settings Panel', 'https://app.example.com/render-settings');
    }

    // Locators
    get selectors() {
        return {
            panel: '[data-testid="render-settings-panel"]',
            resolutionDropdown: '[data-testid="resolution-dropdown"]',
            frameRateInput: '[data-testid="frame-rate-input"]',
            renderButton: '[data-testid="render-button"]',
            cancelButton: '[data-testid="cancel-button"]',
            successMessage: '[data-testid="success-message"]',
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
        await this.waitForElementVisible(this.selectors.panel);
    }

    // Interaction methods
    async selectResolution(resolution) {
        await this.selectFromDropdown(this.selectors.resolutionDropdown, resolution);
        return this.createResponse(true, 'Resolution selected successfully.');
    }

    async enterFrameRate(frameRate) {
        await this.enterText(this.selectors.frameRateInput, frameRate);
        return this.createResponse(true, 'Frame rate entered successfully.');
    }

    async clickRenderButton() {
        await this.clickElement(this.selectors.renderButton);
        return this.createResponse(true, 'Render button clicked.');
    }

    async clickCancelButton() {
        await this.clickElement(this.selectors.cancelButton);
        return this.createResponse(true, 'Cancel button clicked.');
    }

    // Validation methods
    async validateSuccessMessage() {
        await this.waitForElementVisible(this.selectors.successMessage);
        const message = await this.getText(this.selectors.successMessage);
        return this.createResponse(true, message);
    }

    async validateErrorMessage() {
        await this.waitForElementVisible(this.selectors.errorMessage);
        const message = await this.getText(this.selectors.errorMessage);
        return this.createResponse(true, message);
    }

    // Workflow methods
    async renderVideo(resolution, frameRate) {
        await this.selectResolution(resolution);
        await this.enterFrameRate(frameRate);
        await this.clickRenderButton();
        
        // Wait for render to complete
        await this.driver.sleep(2000);
        return this.validateSuccessMessage();
    }

    async cancelRender() {
        await this.clickCancelButton();
        return this.createResponse(true, 'Render cancelled successfully.');
    }

    async validateAllElementsPresent() {
        const requiredElements = [
            this.selectors.panel,
            this.selectors.resolutionDropdown,
            this.selectors.frameRateInput,
            this.selectors.renderButton,
            this.selectors.cancelButton
        ];
        return this.validateAllElementsPresent(requiredElements);
    }
}

module.exports = RenderSettingsPanel;
