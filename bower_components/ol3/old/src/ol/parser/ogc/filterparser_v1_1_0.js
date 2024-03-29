goog.provide('ol.parser.ogc.Filter_v1_1_0');

goog.require('goog.asserts');
goog.require('goog.object');
goog.require('ol.expr');
goog.require('ol.expr.Call');
goog.require('ol.expr.Comparison');
goog.require('ol.expr.ComparisonOp');
goog.require('ol.expr.Identifier');
goog.require('ol.expr.Literal');
goog.require('ol.expr.functions');
goog.require('ol.geom.Geometry');
goog.require('ol.parser.ogc.Filter_v1');
goog.require('ol.parser.ogc.GML_v3');



/**
 * @constructor
 * @extends {ol.parser.ogc.Filter_v1}
 */
ol.parser.ogc.Filter_v1_1_0 = function() {
  goog.base(this);
  this.version = '1.1.0';
  this.schemaLocation = 'http://www.opengis.net/ogc ' +
      'http://schemas.opengis.net/filter/1.1.0/filter.xsd';
  goog.object.extend(this.readers['http://www.opengis.net/ogc'], {
    'PropertyIsEqualTo': function(node, obj) {
      var matchCase = node.getAttribute('matchCase');
      var container = {}, filter;
      this.readChildNodes(node, container);
      if (matchCase === 'false' || matchCase === '0') {
        filter = new ol.expr.Call(new ol.expr.Identifier(ol.expr.functions.IEQ),
            [container.property, container.value]);
      } else {
        filter = new ol.expr.Comparison(
            ol.expr.ComparisonOp.EQ,
            container.property,
            container.value);
      }
      obj.filters.push(filter);
    },
    'PropertyIsNotEqualTo': function(node, obj) {
      var matchCase = node.getAttribute('matchCase');
      var container = {}, filter;
      this.readChildNodes(node, container);
      if (matchCase === 'false' || matchCase === '0') {
        filter = new ol.expr.Call(new ol.expr.Identifier(
            ol.expr.functions.INEQ),
            [container.property, container.value]);
      } else {
        filter = new ol.expr.Comparison(
            ol.expr.ComparisonOp.NEQ,
            container.property,
            container.value);
      }
      obj.filters.push(filter);
    },
    'PropertyIsLike': function(node, obj) {
      var container = {};
      this.readChildNodes(node, container);
      var args = [];
      args.push(container.property, container.value,
          new ol.expr.Literal(node.getAttribute('wildCard')),
          new ol.expr.Literal(node.getAttribute('singleChar')),
          new ol.expr.Literal(node.getAttribute('escapeChar')),
          new ol.expr.Literal(node.getAttribute('matchCase')));
      obj.filters.push(new ol.expr.Call(
          new ol.expr.Identifier(ol.expr.functions.LIKE), args));
    }
  });
  goog.object.extend(this.writers['http://www.opengis.net/ogc'], {
    'PropertyIsEqualTo': function(filter) {
      var node = this.createElementNS('ogc:PropertyIsEqualTo');
      var property, value;
      if (filter instanceof ol.expr.Call) {
        var args = filter.getArgs();
        property = args[0];
        value = args[1];
        node.setAttribute('matchCase', false);
      } else {
        property = filter.getLeft();
        value = filter.getRight();
      }
      this.writeNode('PropertyName', property, null, node);
      this.writeOgcExpression(value, node);
      return node;
    },
    'PropertyIsNotEqualTo': function(filter) {
      var node = this.createElementNS('ogc:PropertyIsNotEqualTo');
      var property, value;
      if (filter instanceof ol.expr.Call) {
        var args = filter.getArgs();
        property = args[0];
        value = args[1];
        node.setAttribute('matchCase', false);
      } else {
        property = filter.getLeft();
        value = filter.getRight();
      }
      this.writeNode('PropertyName', property, null, node);
      this.writeOgcExpression(value, node);
      return node;
    },
    'PropertyIsLike': function(filter) {
      var node = this.createElementNS('ogc:PropertyIsLike');
      var args = filter.getArgs();
      goog.asserts.assert(args[2] instanceof ol.expr.Literal);
      goog.asserts.assert(args[3] instanceof ol.expr.Literal);
      goog.asserts.assert(args[4] instanceof ol.expr.Literal);
      node.setAttribute('wildCard', args[2].getValue());
      node.setAttribute('singleChar', args[3].getValue());
      node.setAttribute('escapeChar', args[4].getValue());
      if (goog.isDefAndNotNull(args[5])) {
        goog.asserts.assert(args[5] instanceof ol.expr.Literal);
        node.setAttribute('matchCase', args[5].getValue());
      }
      var property = args[0];
      if (goog.isDef(property)) {
        this.writeNode('PropertyName', property, null, node);
      }
      this.writeNode('Literal', args[1], null, node);
      return node;
    },
    'BBOX': function(filter) {
      var node = this.createElementNS('ogc:BBOX');
      var args = filter.getArgs();
      goog.asserts.assert(args[0] instanceof ol.expr.Literal);
      goog.asserts.assert(args[1] instanceof ol.expr.Literal);
      goog.asserts.assert(args[2] instanceof ol.expr.Literal);
      goog.asserts.assert(args[3] instanceof ol.expr.Literal);
      goog.asserts.assert(args[4] instanceof ol.expr.Literal);
      var bbox = [
        args[0].getValue(), args[1].getValue(),
        args[2].getValue(), args[3].getValue()
      ];
      var projection = args[4].getValue();
      var property = args[5];
      // PropertyName is optional in 1.1.0
      if (goog.isDefAndNotNull(property)) {
        this.writeNode('PropertyName', property, null, node);
      }
      var box = this.writeNode('Envelope', bbox,
          'http://www.opengis.net/gml');
      if (goog.isDefAndNotNull(projection)) {
        box.setAttribute('srsName', projection);
      }
      node.appendChild(box);
      return node;
    },
    'SortBy': function(sortProperties) {
      var node = this.createElementNS('ogc:SortBy');
      for (var i = 0, l = sortProperties.length; i < l; i++) {
        this.writeNode('SortProperty', sortProperties[i], null, node);
      }
      return node;
    },
    'SortProperty': function(sortProperty) {
      var node = this.createElementNS('ogc:SortProperty');
      this.writeNode('PropertyName', sortProperty['property'], null, node);
      goog.asserts.assert(sortProperty['order'] instanceof ol.expr.Literal);
      this.writeNode('SortOrder',
          (sortProperty['order'].getValue() == 'DESC') ? 'DESC' : 'ASC', null,
          node);
      return node;
    },
    'SortOrder': function(value) {
      var node = this.createElementNS('ogc:SortOrder');
      node.appendChild(this.createTextNode(value));
      return node;
    }
  });
  this.setGmlParser(new ol.parser.ogc.GML_v3());
};
goog.inherits(ol.parser.ogc.Filter_v1_1_0,
    ol.parser.ogc.Filter_v1);


/**
 * @param {ol.expr.Call} filter The filter to write out.
 * @param {string} name The name of the spatial operator.
 * @return {Element} The node created.
 * @private
 */
ol.parser.ogc.Filter_v1_1_0.prototype.writeSpatial_ = function(filter, name) {
  var node = this.createElementNS('ogc:' + name);
  var args = filter.getArgs();
  var property, geom = null, bbox, call, projection;
  if (args[0] instanceof ol.expr.Literal && goog.isNumber(args[0].getValue())) {
    goog.asserts.assert(args[1] instanceof ol.expr.Literal);
    goog.asserts.assert(args[2] instanceof ol.expr.Literal);
    goog.asserts.assert(args[3] instanceof ol.expr.Literal);
    bbox = [
      args[0].getValue(), args[1].getValue(),
      args[2].getValue(), args[3].getValue()
    ];
    projection = args[4];
    property = args[5];
  } else if (args[0] instanceof ol.expr.Literal &&
      args[0].getValue() instanceof ol.geom.Geometry) {
    geom = args[0].getValue();
    if (name === 'DWithin') {
      projection = args[3];
      property = args[4];
    } else {
      projection = args[1];
      property = args[2];
    }
  } else if (args[0] instanceof ol.expr.Call) {
    call = args[0];
    if (name === 'DWithin') {
      projection = args[3];
      property = args[4];
    } else {
      projection = args[1];
      property = args[2];
    }
  }
  if (goog.isDefAndNotNull(property)) {
    this.writeNode('PropertyName', property, null, node);
  }
  if (goog.isDef(call)) {
    this.writeNode('Function', call, null, node);
  } else {
    var child;
    if (geom !== null) {
      child = this.writeNode('_geometry', {value: geom},
          this.gmlParser_.featureNS).firstChild;
    } else if (bbox.length === 4) {
      child = this.writeNode('Envelope', bbox,
          'http://www.opengis.net/gml');
    }
    if (goog.isDef(child)) {
      goog.asserts.assert(projection instanceof ol.expr.Literal);
      if (goog.isDefAndNotNull(projection.getValue())) {
        child.setAttribute('srsName', projection.getValue());
      }
      node.appendChild(child);
    }
  }
  return node;
};
