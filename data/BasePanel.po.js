// BasePanel.js - Shared base class for all Page Objects
const { By, until, Select } = require('selenium-webdriver');

class BasePanel {
    constructor(driver, panelName, baseUrl) {
        this.driver = driver;
        this.panelName = panelName;
        this.baseUrl = baseUrl;
        
        // Consistent timeout configuration
        this.timeouts = {
            short: 3000,
            medium: 10000,
            long: 30000
        };
    }

    // Shared utility methods using correct Selenium JS API
    async waitForElementVisible(locator, timeout = this.timeouts.medium) {
        await this.driver.wait(until.elementLocated(locator), timeout);
        await this.driver.wait(until.elementIsVisible(this.driver.findElement(locator)), timeout);
    }

    async waitForElementInteractable(locator, timeout = this.timeouts.medium) {
        await this.driver.wait(until.elementLocated(locator), timeout);
        const element = await this.driver.findElement(locator);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await this.driver.wait(until.elementIsEnabled(element), timeout);
    }

    async waitForLoadingToComplete(loadingLocator, timeout = this.timeouts.long) {
        try {
            const spinners = await this.driver.findElements(loadingLocator);
            if (spinners.length === 0) return;
            
            await this.driver.wait(until.stalenessOf(spinners[0]), timeout);
            
        } catch (error) {
            throw new Error(`Loading did not complete within ${timeout}ms: ${error.message}`);
        }
    }

    async isLoadingVisible(loadingLocator) {
        try {
            const spinners = await this.driver.findElements(loadingLocator);
            if (spinners.length === 0) return false;
            return await spinners[0].isDisplayed();
        } catch (error) {
            return false;
        }
    }

    async waitForCondition(conditionFn, timeout = this.timeouts.medium, errorMessage = 'Condition not met') {
        try {
            await this.driver.wait(conditionFn, timeout);
        } catch (error) {
            throw new Error(`${errorMessage}: ${error.message}`);
        }
    }

    // Consistent message retrieval
    async getMessage(locator, waitTimeout = this.timeouts.medium) {
        try {
            await this.driver.wait(until.elementLocated(locator), waitTimeout);
            const element = await this.driver.findElement(locator);
            await this.driver.wait(until.elementIsVisible(element), waitTimeout);
            return await element.getText();
        } catch (error) {
            return null;
        }
    }

    // Consistent input handling
    async enterText(locator, text, shouldVerify = true) {
        try {
            await this.waitForElementInteractable(locator);
            const field = await this.driver.findElement(locator);
            await field.clear();
            await field.sendKeys(text);
            
            if (shouldVerify) {
                const actualValue = await field.getAttribute('value');
                if (actualValue !== text) {
                    throw new Error(`Input verification failed. Expected: ${text}, Actual: ${actualValue}`);
                }
            }
            
        } catch (error) {
            throw new Error(`Failed to enter text '${text}': ${error.message}`);
        }
    }

    // Consistent button clicking
    async clickElement(locator, elementName = 'element') {
        try {
            await this.waitForElementInteractable(locator);
            const element = await this.driver.findElement(locator);
            
            const isEnabled = await element.isEnabled();
            if (!isEnabled) {
                throw new Error(`${elementName} is disabled`);
            }
            
            await element.click();
            
        } catch (error) {
            throw new Error(`Failed to click ${elementName}: ${error.message}`);
        }
    }

    // Consistent dropdown selection
    async selectFromDropdown(locator, optionText, elementName = 'dropdown') {
        try {
            await this.waitForElementInteractable(locator);
            const dropdown = await this.driver.findElement(locator);
            
            const select = new Select(dropdown);
            await select.selectByVisibleText(optionText);
            
            // Verify selection
            const selectedOption = await select.getFirstSelectedOption();
            const selectedText = await selectedOption.getText();
            if (selectedText !== optionText) {
                throw new Error(`${elementName} selection failed. Expected: ${optionText}, Selected: ${selectedText}`);
            }
            
        } catch (error) {
            throw new Error(`Failed to select '${optionText}' from ${elementName}: ${error.message}`);
        }
    }

    // Standard navigation with error handling
    async navigateToPanel() {
        try {
            await this.driver.get(this.baseUrl);
            await this.waitForPageLoad();
            return { success: true, message: `Successfully navigated to ${this.panelName}` };
        } catch (error) {
            throw new Error(`Failed to navigate to ${this.panelName}: ${error.message}`);
        }
    }

    // Must be implemented by subclasses
    async waitForPageLoad() {
        throw new Error('waitForPageLoad() must be implemented by subclass');
    }

    get locators() {
        throw new Error('locators getter must be implemented by subclass');
    }

    // Standard element validation
    async validateRequiredElements(requiredElements) {
        const missingElements = [];

        for (const element of requiredElements) {
            try {
                await this.driver.wait(until.elementLocated(element.locator), this.timeouts.medium);
                const el = await this.driver.findElement(element.locator);
                const isDisplayed = await el.isDisplayed();
                
                if (!isDisplayed) {
                    missingElements.push(element.name);
                }
            } catch (error) {
                missingElements.push(element.name);
            }
        }

        if (missingElements.length > 0) {
            throw new Error(`Missing elements in ${this.panelName}: ${missingElements.join(', ')}`);
        }

        return true;
    }

    // Standard response format
    createResponse(success, message, additionalData = {}) {
        return {
            success,
            message,
            panel: this.panelName,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
    }
}

module.exports = BasePanel;