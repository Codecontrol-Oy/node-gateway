var config = require("../config/settings.json")
var http = require('http')
var log4js = require('log4js');
var sinon  = require('sinon');
var chai = require('chai')
chai.use(require('chai-http'))
var gatewayUrl = 'http://localhost:' + config.settings.server.port
sinon.stub(log4js, "getLogger").returns({
    warn: function() {},
    info: function() {},
    error: function() {}
})
var s = require('../server.js')
const settings = {
  settings : {
      cors: {
          allowedOrigin: "*",
          allowCredentials: true,
          allowedMethods: "GET, POST, DELETE, UPDATE, OPTIONS",
          allowedHeaders: "*"
      },
      server: {
          port: 6010, 
          noRouteMatchesErrorMessage: "No route matches the given address",
          noWebsocketRouteMatchesErrorMessage: "No websocket route matches the given address",
          generalErrorMessage: "node-gateway general error",
          host: "127.0.0.1",
          serviceName: "node-gateway"
      }, 
      logger: {
          logconfig : { 
                  appenders: {
                      "node-gateway": { 
                          type: "console"
                      }
                  },
                  categories: { 
                      default: { 
                          appenders: ["node-gateway"], 
                          level: "info" 
                      } 
                  }
          },
          loglevel : "DEBUG"
      }
  }
}

const routes = {
  rules: [
      {
          prefix: ".*/users",
          target: "https://userApi/users:4992",
          type: "http"
      },
      {
          prefix: ".*/organization",
          target: "https://organizationApi/organization:4991",
          type: "http"
      },
      {
          prefix: ".*/organization/users",
          target: "https://organizationApi/organization/users:4000",
          type: "http"
      },
      {
        prefix: ".*/notification",
        target: "wss://notificationApi:4000",
        type: "websocket"
    }
  ]
}

var config = s.configure(settings, routes)
var server = s.server(config)



describe('node-gateway', function () {
  beforeEach(function() {
        s.listen(server)
  })
  afterEach(function() {
    s.close(server)
  })

  describe('Custom configs enabled', function () {
    it('Should return 400 on root url', function (done) {
        chai.request(gatewayUrl)
        .get('/')
        .end(function (err, res) {
            expect(res.error.text).toBe(config.settings.server.noRouteMatchesErrorMessage)
            expect(res.statusCode).toBe(400);
            done();
         });
    })
    it('Should throw 500 on error', function (done) {
        chai.request(gatewayUrl)
        .get('/error')
        .end(function (err, res) {
            expect(res.error.text).toBe(config.settings.server.generalErrorMessage)
            expect(res.statusCode).toBe(500)
            done()
        })
    })
    it('Should return options', function (done) {
      chai.request(gatewayUrl)
      .options('/users')
      .end(function (err, res) {
          expect(res.statusCode).toBe(200)
          done()
      })
  })
  })
})