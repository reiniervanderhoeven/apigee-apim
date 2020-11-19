class Spec {
  constructor (request, config) {
    this.environment = config.environment
    this.request = request
  }

  setRequest (request) {
    this.request = request
  }

  async getAutoFolder () {
    const homeFolder = await this.request(`/homeFolder/contents`)
    const autoFolder = homeFolder.data.contents.find(content => content.name === 'auto' && content.kind === 'Folder')
    if (!autoFolder) {
      await this.createAutoFolder()
      return this.getAutoFolder()
    }
    return autoFolder
  }

  async createAutoFolder () {
    const homeFolder = await this.request(`/homeFolder`)
    const response = await this.request.post(`/folders`, {
      'name': 'auto',
      'Description': 'Automatically generated specs',
      'kind': 'Folder',
      'folder': homeFolder.data.self
    })
    return response.data
  }

  async checkIfSwaggerExists (swagger) {
    const autoFolder = await this.getAutoFolder()
    const autoFolderContent = await this.request(autoFolder.contents)
    return autoFolderContent.data.contents.find(content => content.name === `${swagger.info.title}-v${swagger.info.version.split('.')[0]}-${this.environment}`)
  }

  async createOrUpdateSwagger (swagger) {
    let swaggerSpec = await this.checkIfSwaggerExists(swagger)
    let etag = null
    let url = null
    let self = null
    if (!swaggerSpec) {
      const autoFolder = await this.getAutoFolder()
      const newSpec = await this.request.post('/specs/new', {
        'name': `${swagger.info.title}-v${swagger.info.version.split('.')[0]}-${this.environment}`,
        'kind': 'Doc',
        'description': '',
        'folder': autoFolder.self
      })
      etag = newSpec.headers.etag
      url = newSpec.data.content
      self = newSpec.data.self
    } else {
      const swaggerSpecContent = await this.request(swaggerSpec.content)
      etag = swaggerSpecContent.headers.etag
      url = swaggerSpec.content
      self = swaggerSpec.self
    }

    await this.request({
      method: 'PUT',
      url: url,
      data: swagger,
      headers: { 'Content-Type': 'text/plain', 'If-Match': etag }
    })
    return { self: self, content: url }
  }
}

module.exports = Spec
