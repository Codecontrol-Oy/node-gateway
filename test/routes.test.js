var config = require("../config/settings.json")
var http = require('http')
var log4js = require('log4js');
var sinon = require('sinon');
var ws = require('ws')
var chai = require('chai')
chai.use(require('chai-http'))
var gatewayUrl = 'http://localhost:' + config.settings.server.port
sinon.stub(log4js, "getLogger").returns({
  warn: function () { },
  info: function () { },
  error: function () { }
})
var s = require('../server.js');
const { expect } = require("chai");
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
          expect(res.error.text).to.equal(config.settings.server.noRouteMatchesErrorMessage)
          expect(res.statusCode).to.equal(400);
          done();
        });
    })
    it('Should throw 500 on error', function (done) {
      chai.request(gatewayUrl)
        .get('/error')
        .end(function (err, res) {
          expect(res.error.text).to.equal(config.settings.server.generalErrorMessage)
          expect(res.statusCode).to.equal(500)
          done()
        })
    })
    it('Should return options', function (done) {
      chai.request(gatewayUrl)
        .options('/users')
        .end(function (err, res) {
          expect(res.statusCode).to.equal(200)
          done()
        })
    })
  })
  describe('Websocket basic tests', function () {
    it('Should return 500 with invalid connection upgrade', function(done) {
      const client = new ws("ws://localhost:6010/notifications")
      client.on('error', (err) => {
        expect(err.toString()).to.equal("Error: Unexpected server response: 500")
        done()
      })
    }),
    it('Should return 400 with invalid websocket route', function(done) {
      const client = new ws("ws://localhost:6010/wrong_path")
      client.on('error', (err) => {
        expect(err.toString()).to.equal("Error: Unexpected server response: 400")
        done()
      })
    })
  })
})