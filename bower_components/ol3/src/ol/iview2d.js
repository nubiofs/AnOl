goog.provide('ol.IView2D');

goog.require('ol.Coordinate');



/**
 * Interface for views.
 * @interface
 */
ol.IView2D = function() {
};


/**
 * @return {ol.Coordinate|undefined} Map center.
 * @todo stability experimental
 */
ol.IView2D.prototype.getCenter = function() {
};


/**
 * @return {ol.proj.Projection|undefined} Map projection.
 * @todo stability experimental
 */
ol.IView2D.prototype.getProjection = function() {
};


/**
 * @return {number|undefined} Map resolution.
 * @todo stability experimental
 */
ol.IView2D.prototype.getResolution = function() {
};


/**
 * @return {number|undefined} Map rotation.
 * @todo stability experimental
 */
ol.IView2D.prototype.getRotation = function() {
};


/**
 * @return {oli.View2DState} View2D state.
 */
ol.IView2D.prototype.getView2DState = function() {
};


/**
 * @return {boolean} Is defined.
 */
ol.IView2D.prototype.isDef = function() {
};
