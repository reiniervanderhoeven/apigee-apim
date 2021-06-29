#!/usr/bin/env node
const Apigee = require('./lib/apigee')

module.exports = {
  updateCustomAttribute: async (config, developer, app, attributeName,attributeValue) => {
    const apigee = new Apigee(config)
    const developerApp = await apigee.developerApps.updateCustomAttribute(developer,app, attributeName, attributeValue)
    return developerApp
  },
  getCustomAttribute: async (config, developer, app, attributeName) => {
    const apigee = new Apigee(config)
    const developerApp = await apigee.developerApps.getCustomAttribute(developer,app, attributeName)
    return developerApp
  }
}