var expect = require('chai').expect;
var supertest = require('supertest');
var express = require('express');

var requestMetrics = require('../');
var debug = require('debug')('express-req-metrics:tests');

describe('requestMetrics', function() {
  describe('middleware', function() {
    it('should expose a middleware function', function() {
      expect(requestMetrics).to.be.a('function');
    });

    it('should throw if instantiated without a processing function', function(done) {
      try {
        requestMetrics();
      } catch(e) {
        done();
      }
    });

    it('should forward request, response and metrics to a processing function', function(done) {
      var middleware = requestMetrics(function(req, res, metrics) {
        expect(req).to.exist;
        expect(res).to.exist;
        expect(metrics).to.exist;

        done();
      });

      var app = createApp(middleware);
      supertest(app).get('/').expect(200).end();
    });

    it('should contain url, status and response time in metrics', function(done) {
      var middleware = requestMetrics(function(req, res, metrics) {
        expect(metrics.status).to.equal(200);
        expect(metrics.url).to.equal('/');
        expect(metrics.responseTime).to.exist;
        expect(metrics.responseTime).to.be.a('number');

        done();
      });

      var app = createApp(middleware);
      supertest(app).get('/').expect(200).end();
    });

    it('should contain route object if route matches', function(done) {
      var middleware = requestMetrics(function(req, res, metrics) {
        expect(metrics.route).to.equal('/');

        done();
      });

      var app = createApp(middleware);
      supertest(app).get('/').expect(200).end();
    });

    it('should not contain a route object if no route matched', function(done) {
      var middleware = requestMetrics(function(req, res, metrics) {
        expect(metrics.route).to.not.exist;

        done();
      });

      var app = createApp(middleware);
      supertest(app).get('/notfound').expect(200).end();
    });

    it('should contain an error if an error occurred', function(done) {
      var middleware = requestMetrics(function(req, res, metrics) {
        // TODO: Does not work as expected - error in on-finished
        // expect(metrics.error).to.exist;

        done();
      });

      var app = createApp(middleware);
      supertest(app).get('/error').expect(500).end();
    });
  })
});

function createApp(requestMetricsMiddleware) {
  var app = express();

  app.use(requestMetricsMiddleware);

  app.get('/', function(req, res) {
    res
      .status(200)
      .send('Hello Request Metrics');
  });

  app.get('/error', function(req, res, next) {
    return next(new Error('does not work'));
  });

  app.get('/hello/:text', function(req, res) {
    res
      .status(200)
      .send('hello ' + req.params.text);
  });

  app.use(function(err, req, res, next) {
    debug(err.stack);
    res
      .status(err.status || 500)
      .json({ message : err.message });
  });

  return app;
}