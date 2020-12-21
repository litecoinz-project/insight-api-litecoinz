'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.coinMarketCapRate = 0; // USD/LTZ
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if (self.coinMarketCapRate > 0 && currentTime < (self.timestamp + self.currencyDelay)) {
    return res.jsonp({
      status: 200,
      data: {
        bitstamp: self.coinMarketCapRate
      }
    });
  }

  self.timestamp = currentTime;
  request('https://rates.litecoinz.org/', function(err, response, body) {
    if (err) {
      self.node.log.error(err);
    }
    if (!err && response.statusCode === 200) {
      const cmcData = JSON.parse(body);
      self.coinMarketCapRate = parseFloat(cmcData[1].rate);
    }
    res.jsonp({
      status: 200,
      data: {
        bitstamp: self.coinMarketCapRate
      }
    });
  });
};

module.exports = CurrencyController;
