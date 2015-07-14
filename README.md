# express-req-metrics
Express middleware to collect request metrics and pass request metrics to a processing function.

## Installation

    npm install express-req-metrics

## Usage

```javascript
var express = require('express');
var requestMetrics = require('express-req-metrics');

var app = express();

app.use(requestMetrics(function(req, res, metrics) {
  console.log(metrics);
}));
```

## Metrics
Metrics provided by `express-req-metrics`

```javascript
{ 
  url: '/',
  method: 'GET',
  route: '/',
  status: 200,
  responseTime: 7.499312,
  referrer: undefined,
  remoteAddress: '::ffff:127.0.0.1',
  remoteUser: '-',
  httpVersion: '1.1',
  userAgent: 'node-superagent/0.21.0',
  startTime: Thu May 07 2015 13:22:39 GMT+0200 (W. Europe Daylight Time),
  error: null 
}
```

route is set to route.path only if a route handler processed the request

## Using express-req-metrics together with bunyan

```javascript

// logger setup
var bunyan = require('bunyan');

var logger = bunyan.createLogger({
  name : 'demo',
  streams: [
    { path : './logs/requests.log' },
    { stream : process.stdout }
  ]
});

// express setup
var express = require('express');
var requestMetrics = require('express-req-metrics');

var app = express();

app.use(requestMetrics(function(req, res, metrics) {
  logger.info(metrics);
}));

```
    
