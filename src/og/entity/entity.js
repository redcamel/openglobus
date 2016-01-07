goog.provide('og.Entity');
goog.provide('og.entity');

goog.require('og.math.Vector3');
goog.require('og.Billboard');
goog.require('og.Label');

/**
 * Entity instances aggregate multiple forms of visualization into a single high-level object.
 * They can be created manually and added to entity collection.
 *
 * @class
 * @param {Object} [options] - Entity options:
 * @param {string} [options.name] - A human readable name to display to users. It does not have to be unique.
 * @param {Object} [properties] - Entity properties.
 */
og.Entity = function (options, properties) {

    options = options || {};

    this.id = og.Entity.__staticCounter++;

    this.properties = properties || {};
    this.properties.name = this.properties.name || "noname";

    this.childrenNodes = [];
    this.parent = null;

    /**
     * Entity position
     * @private
     * @type {og.math.Vector3}
     */
    this._position = og.utils.createVector3(options.position);

    /**
     * Visibility.
     * @private
     * @type {boolean}
     */
    this._visibility = options.visibility != undefined ? options.visibility : true;

    /**
     * Entity collection that this entity belongs to.
     * @private
     * @type {og.EntityCollection}
     */
    this._entityCollection = null;

    this._entityCollectionIndex = -1;

    this._pickingColor = new og.math.Vector3(0, 0, 0);

    this._featureConstructorArray = {
        "billboard": [og.Billboard, this.setBillboard],
        "label": [og.Label, this.setLabel]
    };

    this.billboard = this._createOptionFeature('billboard', options.billboard);
    this.label = this._createOptionFeature('label', options.label);
    //this.lineString = null;
    //this.linearRing = null;
    //this.polygon = null;
    //this.multiPolygon = null;
    //...
};

og.entity = function (options, properties) {
    return new og.Entity(options, properties);
};

og.Entity.__staticCounter = 0;

og.Entity.prototype._createOptionFeature = function (featureName, options) {
    if (options) {
        var c = this._featureConstructorArray[featureName];
        return c[1].call(this, new c[0](options));
    } return null;
};

/**
 * Adds current entity into the specified entity collection.
 * @public
 * @param {og.EntityCollection} entityCollection - Specified entity collection.
 */
og.Entity.prototype.addTo = function (entityCollection) {
    entityCollection.add(this);
    return this;
};

/**
 * Removes current entity from specifeid entity collection.
 * @public
 */
og.Entity.prototype.remove = function () {
    this._entityCollection && this._entityCollection.removeEntity(this);
};

/**
 * Sets the entity visibility.
 * @public
 * @param {boolean} visibilty - Entity visibility.
 */
og.Entity.prototype.setVisibility = function (visibility) {
    this._visibility = visibility;

    //billboards
    this.billboard && this.billboard.setVisibility(visibility);

    //labels
    this.label && this.label.setVisibility(visibility);

    for (var i = 0; i < this.childrenNodes.length; i++) {
        this.childrenNodes[i].setVisibility(visibility);
    }
};

/**
 * Returns entity visibility.
 * @public
 * @returns {boolean}
 */
og.Entity.prototype.getVisibility = function () {
    return this._visibility;
};

/**
 * Sets entity position.
 * @public
 * @param {og.math.Vector3} position - Position in 3d space.
 */
og.Entity.prototype.setPosition3v = function (position) {
    this.setPosition(position.x, position.y, position.z);
};

/**
 * Sets entity position.
 * @public
 * @param {number} x - 3d space X - position.
 * @param {number} y - 3d space Y - position.
 * @param {number} z - 3d space Z - position.
 */
og.Entity.prototype.setPosition = function (x, y, z) {

    var p = this._position;

    p.x = x;
    p.y = y;
    p.z = z;

    //billboards
    this.billboard && this.billboard.setPosition3v(p);

    //labels
    this.label && this.label.setPosition3v(p);

    for (var i = 0; i < this.childrenNodes.length; i++) {
        this.childrenNodes[i].setPosition3v(p);
    }
};

/**
 * Returns position.
 * @public
 * @returns {og.math.Vector3}
 */
og.Entity.prototype.getPosition = function () {
    return this._position;
};

/**
 * Sets entity billboard.
 * @public
 * @param {og.Billboard} billboard - Billboard image.
 */
og.Entity.prototype.setBillboard = function (billboard) {
    if (this.billboard) {
        this.billboard.remove();
    }
    this.billboard = billboard;
    this.billboard._entity = this;
    this.billboard.setPosition3v(this._position);
    this.billboard.setVisibility(this._visibility);
    this._entityCollection && this._entityCollection._billboardHandler.add(billboard);
    return billboard;
};

/**
 * Sets entity label.
 * @public
 * @param {og.Label} label - Text label.
 */
og.Entity.prototype.setLabel = function (label) {
    if (this.label) {
        this.label.remove();
    }
    this.label = label;
    this.label._entity = this;
    this.label.setPosition3v(this._position);
    this.label.setVisibility(this._visibility);
    this._entityCollection && this._entityCollection._labelHandler.add(label);
    return label;
};

/**
 * Append child entity.
 * @public
 * @param {og.Entity} entity - Entity child.
 */
og.Entity.prototype.appendChild = function (entity) {
    entity._entityCollection = this._entityCollection;
    entity._pickingColor = this._pickingColor;
    entity.parent = this;
    this.childrenNodes.push(entity);
    this._entityCollection && this._entityCollection._addRecursively(entity);
};

/**
 * Appends entity items(billboard, label etc.) picking color.
 * @public
 */
og.Entity.prototype.setPickingColor = function () {

    var c = this._pickingColor;

    //billboards
    this.billboard && this.billboard.setPickingColor3v(c);

    //labels
    this.label && this.label.setPickingColor3v(c);

    for (var i = 0; i < this.childrenNodes.length; i++) {
        this.childrenNodes[i].setPickingColor3v(c);
    }
};