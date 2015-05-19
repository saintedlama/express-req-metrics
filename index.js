var auth = require('basic-auth');
var onFinished = require('on-finished');

module.exports = middleware;
module.exports.getRequestMetrics = getRequestMetrics;

function middleware(fn) {
  if (!fn) {
    throw new Error('Callback function to process request metrics is required');
  }

  return function requestMetrics(req, res, next) {
    req._startAt = process.hrtime();
    req._startTime = new Date();
    req._remoteAddress = getIP(req);

    onFinished(res, function(err) {
      var metrics = getRequestMetrics(req, res);

      metrics.error = err;

      fn(req, res, metrics);
    });

    next();
  };
}

function getRequestMetrics(req, res) {
  return {
    url : req.originalUrl || req.url,
    method : req.method,
    route : req.route?req.route.path:undefined,
    status : res._header ? res.statusCode : null,
    responseTime : getResponseTime(req, res),
    referrer : req.headers['referer'] || req.headers['referrer'],
    remoteAddress : getIP(req),
    remoteUser : getRemoteUser(req),
    httpVersion : req.httpVersionMajor + '.' + req.httpVersionMinor,
    userAgent : req.headers['user-agent'],
    startTime : req._startTime || new Date()
  }
}

function getRemoteUser(req) {
  var creds = auth(req);
  var user = (creds && creds.name) || '-';
  return user;
}

function getResponseTime(req, res){
  if (!res._header || !req._startAt) return;

  var diff = process.hrtime(req._startAt);
  var ms = diff[0] * 1e3 + diff[1] * 1e-6;

  return ms;
}


function getIP(req) {
  return req.ip
    || req._remoteAddress
    || (req.connection && req.connection.remoteAddress)
    || undefined;
}

