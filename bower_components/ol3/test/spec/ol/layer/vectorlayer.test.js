goog.provide('ol.test.layer.Vector');

describe('ol.layer.Vector', function() {

  describe('constructor', function() {
    var source = new ol.source.Vector();
    var style = new ol.style.Style();

    it('creates a new layer', function() {
      var layer = new ol.layer.Vector({source: source});
      expect(layer).to.be.a(ol.layer.Vector);
      expect(layer).to.be.a(ol.layer.Layer);
    });

    it('accepts a style option with a single style', function() {
      var layer = new ol.layer.Vector({
        source: source,
        style: style
      });

      var styleFunction = layer.getStyleFunction();
      expect(styleFunction()).to.eql([style]);
    });

    it('accepts a style option with an array of styles', function() {
      var layer = new ol.layer.Vector({
        source: source,
        style: [style]
      });

      var styleFunction = layer.getStyleFunction();
      expect(styleFunction()).to.eql([style]);
    });

    it('accepts a style option with a style function', function() {
      var layer = new ol.layer.Vector({
        source: source,
        style: function(feature, resolution) {
          return [style];
        }
      });

      var styleFunction = layer.getStyleFunction();
      expect(styleFunction()).to.eql([style]);
    });

  });

  describe('#setStyle()', function() {

    var source = new ol.source.Vector();
    var style = new ol.style.Style();

    it('allows the style to be set after construction', function() {
      var layer = new ol.layer.Vector({
        source: source
      });

      layer.setStyle(style);
      expect(layer.getStyle()).to.be(style);
    });

    it('dispatches the change event', function(done) {
      var layer = new ol.layer.Vector({
        source: source
      });
      layer.on('change', function() {
        done();
      });
      layer.setStyle(style);
    });

    it('updates the internal style function', function() {
      var layer = new ol.layer.Vector({
        source: source
      });
      expect(layer.getStyleFunction()).to.be(undefined);
      layer.setStyle(style);
      expect(layer.getStyleFunction()).to.be.a('function');
    });

  });

  describe('#getStyle()', function() {

    var source = new ol.source.Vector();
    var style = new ol.style.Style();

    it('returns what is provided to setStyle', function() {
      var layer = new ol.layer.Vector({
        source: source
      });

      expect(layer.getStyle()).to.be(null);

      layer.setStyle(style);
      expect(layer.getStyle()).to.be(style);

      layer.setStyle([style]);
      expect(layer.getStyle()).to.eql([style]);

      var styleFunction = function(feature, resolution) {
        return [style];
      };
      layer.setStyle(styleFunction);
      expect(layer.getStyle()).to.be(styleFunction);

    });

  });

});

goog.require('ol.layer.Layer');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.Style');
