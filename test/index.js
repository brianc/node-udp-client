var assert = require('assert');
var dgram = require('dgram');
var UdpClient = require(__dirname + '/../');

describe('udp-gun', function() {
  before(function() {
    this.port = 12202;
    this.gun = new UdpClient(this.port, 'localhost');
  })

  it('fires packets without callback', function(done) {
    var gun = this.gun;
    var count = 0;
    var listener = dgram.createSocket('udp4', function(message) {
      count++;
      assert.equal(message.length, 4);
      if(count === 3) {
        listener.on('close', done);
        listener.close();
      }
    });

    listener.bind(this.port, function() {
      var buffer = Buffer([1,2,3,4]);
      gun.send(buffer);
      gun.send(buffer);
      gun.send(buffer);
    });
  });

  it('fires packets', function(done) {
    var gun = this.gun;
    var listener = dgram.createSocket('udp4', function(message) {
      assert.equal(message.length, 4);
      listener.on('close', done);
      listener.close();
    });
    listener.bind(this.port, function() {
      gun.send(Buffer([1,2,3,4]), function(err, bytes) {
        assert.ifError(err);
        assert.equal(bytes, 4);
      });
    });
  });

  it('fires to a non-listener', function(done) {
    this.gun.send(Buffer([1,2,3]), function(err, bytes) {
      done();
    });
  });

  it('errors on dns failure', function(done) {
    var gun = new UdpClient(this.port, 'http://aksjdlfsldffsdiiiiiiialskdfjalskdfjalskdfjasdf');
    gun.send(Buffer([1,2,3,4]), function(err, bytes) {
      assert(err);
      done();
    });
  });
});
