goog.provide('ol.test.format.TopoJSON');

var aruba = {
  type: 'Topology',
  transform: {
    scale: [0.036003600360036005, 0.017361589674592462],
    translate: [-180, -89.99892578124998]
  },
  objects: {
    aruba: {
      type: 'Polygon',
      properties: {
        prop0: 'value0'
      },
      arcs: [[0]],
      id: 533
    }
  },
  arcs: [
    [[3058, 5901], [0, -2], [-2, 1], [-1, 3], [-2, 3], [0, 3], [1, 1], [1, -3],
      [2, -5], [1, -1]]
  ]
};


describe('ol.format.TopoJSON', function() {

  var format;
  before(function() {
    format = new ol.format.TopoJSON();
  });

  describe('constructor', function() {
    it('creates a new format', function() {
      expect(format).to.be.a(ol.format.Feature);
      expect(format).to.be.a(ol.format.TopoJSON);
    });
  });

  describe('#readFeaturesFromTopology_()', function() {

    it('creates an array of features from a topology', function() {
      var features = format.readFeaturesFromObject(aruba);
      expect(features).to.have.length(1);

      var feature = features[0];
      expect(feature).to.be.a(ol.Feature);

      var geometry = feature.getGeometry();
      expect(geometry).to.be.a(ol.geom.Polygon);

      // Parses identifier
      expect(feature.getId()).to.be(533);
      // Parses properties
      expect(feature.get('prop0')).to.be('value0');

      expect(geometry.getExtent()).to.eql([
        -70.08100810081008, 12.417091709170947,
        -69.9009900990099, 12.608069195591469
      ]);
    });

  });

  describe('#readFeatures()', function() {

    it('parses simple.json', function(done) {
      afterLoadText('spec/ol/format/topojson/simple.json', function(text) {
        var features = format.readFeatures(text);
        expect(features.length).to.be(3);

        var point = features[0].getGeometry();
        expect(point.getType()).to.be('Point');
        expect(point.getFlatCoordinates()).to.eql([102, 0.5]);

        var line = features[1].getGeometry();
        expect(line.getType()).to.be('LineString');
        expect(line.getFlatCoordinates()).to.eql([
          102, 0, 103, 1, 104, 0, 105, 1
        ]);

        var polygon = features[2].getGeometry();
        expect(polygon.getType()).to.be('Polygon');
        expect(polygon.getFlatCoordinates()).to.eql([
          100, 0, 100, 1, 101, 1, 101, 0, 100, 0
        ]);

        done();
      });
    });

    it('parses world-110m.json', function(done) {
      afterLoadText('spec/ol/format/topojson/world-110m.json', function(text) {

        var features = format.readFeatures(text);
        expect(features.length).to.be(178);

        var first = features[0];
        expect(first).to.be.a(ol.Feature);
        var firstGeom = first.getGeometry();
        expect(firstGeom).to.be.a(ol.geom.MultiPolygon);
        expect(firstGeom.getExtent()).to.eql(
            [-180, -85.60903777459777, 180, 83.64513000000002]);

        var last = features[177];
        expect(last).to.be.a(ol.Feature);
        var lastGeom = last.getGeometry();
        expect(lastGeom).to.be.a(ol.geom.Polygon);
        expect(lastGeom.getExtent()).to.eql([
          25.26325263252633, -22.271802279310577,
          32.848528485284874, -15.50833810039586
        ]);

        done();
      });
    });

  });

});

goog.require('ol.Feature');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.Polygon');
goog.require('ol.format.Feature');
goog.require('ol.format.TopoJSON');
