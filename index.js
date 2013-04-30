var dgram = require('dgram');
var dns = require('dns');

var UdpClient = function(port, address) {
  this.port = port;
  this.address = address;
  this._remoteAddress;
};

UdpClient.fire = function(buffer, port, address, callback) {
  var client = dgram.createSocket('udp4');
  client.send(buffer, 0, buffer.length, port, address, function(err, bytes) {
    client.close();
    if(callback) callback(err, bytes);
  });
};

UdpClient.prototype.send = function(buffer, callback) {
  //already did a dns lookup
  if(this._remoteAddress) {
    return UdpClient.fire(buffer, this.port, this._remoteAddress, callback);
  }
  var self = this;
  if(!this._remoteAddress) {
    //resolve host once and trap error
    if(typeof this.address == 'string') {
      dns.lookup(this.address, 4, function(err, domain) {
        if(err) return callback(err);
        self._remoteAddress = domain;
        UdpClient.fire(buffer, self.port, self._remoteAddress, callback);
      });
    }
  }
};

module.exports = UdpClient;
