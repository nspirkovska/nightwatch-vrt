'use strict'

const getBaselineScreenshotOrCreate = require('./get-baseline-screenshot-or-create'),
    saveScreenshot = require('./save-screenshot'),
    generateScreenshotFilePath = require('./generate-screenshot-file-path'),
    getVrtSettings = require('./get-vrt-settings'),
    Jimp = require('jimp')

/**
 * Compares a screenshot against the baseline screenshot. If the baseline screenshot
 * does not exist in the baseline directory, this function creates it and compares the screenshot 
 * passed as parameter against itself.
 *
 * @param {Object} nightwatchClient Instance of the current nightwatch API interface
 * @param {Object} screenshot Jimp image representation
 */
module.exports = function compareWithBaseline(nightwatchClient, screenshot) {
    const {
        threshold,
        diff_screenshots_path,
        always_save_diff_screenshot
    } = getVrtSettings(nightwatchClient)

    return new Promise((resolve, reject) => {
        getBaselineScreenshotOrCreate(nightwatchClient, screenshot).then((baseline) => {
            const diff = Jimp.diff(screenshot, baseline),
                identical = diff.percent <= (Number.isFinite(threshold) ? threshold : 0.0)

            if (!identical || always_save_diff_screenshot === true) {
                saveScreenshot(
                    nightwatchClient,
                    generateScreenshotFilePath(nightwatchClient, diff_screenshots_path),
                    diff.image,
                    'Saving diff screenshot to the diff screenshots directory.'
                ).then(resolve)
            }

            resolve(identical)
        }, reject)
    })
}
