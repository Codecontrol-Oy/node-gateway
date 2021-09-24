var config = require("../config/settings.json")
var http = require('http')
var log4js = require('log4js');
var sinon = require('sinon');
var chai = require('chai')
chai.use(require('chai-http'))
var gatewayUrl = 'http://localhost:' + config.settings.server.port
sinon.stub(log4js, "getLogger").returns({
  warn: function () { },
  info: function () { },
  error: function () { }
})
var s = require('../server.js')
var config = s.configure()
var server = s.server(config)



describe('node-gateway', function () {
  beforeEach(function () {
    s.listen(server)
  })
  afterEach(function () {
    s.close(server)
  })

  describe('Proxy basic tests', function () {
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