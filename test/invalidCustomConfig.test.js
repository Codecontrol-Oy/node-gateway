var config = require("../config/settings.json")
var s = require('../server.js')
var sinon = require('sinon');
sinon.stub(console, "error")
const settings = {
  settings: {
    cors: {
      allowedOrigin: "abc",
      allowCredentials: "123",
      allowedMethods: "A, B, C, D, E",
      allowedHeaders: "*"
    },
    server: {
      port: "abcd",
      host: 123,
      serviceName: 123
    }
  }
}

const routes = {
  rules: [
    {
      prefix: 123,
    }
  ]
}

describe('node-gateway', function () {

  describe('Invalid settings and routes', function () {
    it('Should throw error with invalid values', function () {
      expect(() => {
        s.configure(settings, routes)
      }).toThrow()
    })
  })
})