import Vue from 'vue';

import {store}           from 'app/store/csi';
import Base            from 'csi/classes/base';
import Collection      from 'csi/classes/collections/collection';


import moment          from 'moment';
import castArray       from 'lodash/castArray'
import cloneDeep       from 'lodash/cloneDeep'
import defaults        from 'lodash/defaults'
import defaultTo       from 'lodash/defaultTo'
import each            from 'lodash/each'
import filter          from 'lodash/filter'
import first           from 'lodash/first'
import flow            from 'lodash/flow'
import get             from 'lodash/get'
import has             from 'lodash/has'
import head            from 'lodash/head'
import invert          from 'lodash/invert'
import isArray         from 'lodash/isArray'
import isEmpty         from 'lodash/isEmpty'
import isEqual         from 'lodash/isEqual'
import isFunction      from 'lodash/isFunction'
import isNil           from 'lodash/isNil'
import isObject        from 'lodash/isObject'
import isObjectLike    from 'lodash/isObjectLike'
import isPlainObject   from 'lodash/isPlainObject'
import isString        from 'lodash/isString'
import isUndefined     from 'lodash/isUndefined'
import keys            from 'lodash/keys'
import mapValues       from 'lodash/mapValues'
import merge           from 'lodash/merge'
import once            from 'lodash/once'
import pick            from 'lodash/pick'
import values          from 'lodash/values'
import uniqueId         from 'lodash/uniqueId'


/**
 * This class is heavily influenced by the VueMC package
 */



const RESERVED = invert([
    '_attributes',
    '_casts',
    '_collections',
    '_errors',
    '_listeners',
    '_reference',
    '_uid',
    'attributes',
]);


const copyFrom = function(source, target, keys) {
    if (keys) {
        source = pick(source, keys);
    }

    each(source, (value, key) => {
        if (isArray(value)) {
            Vue.set(target, key, []);
            copyFrom(value, target[key]);

        } else if (isPlainObject(value)) {
            Vue.set(target, key, {});
            copyFrom(value, target[key]);

        } else if (isObject(value) && isFunction(value.clone)) {
            Vue.set(target, key, value.clone());

        } else {
            Vue.set(target, key, cloneDeep(value));
        }
    });
}


class Model extends Base {

    constructor(attributes) {
        super();

        Vue.set(this, '_reference',   {});
        Vue.set(this, '_attributes',  {});
        Vue.set(this, '_casts', {});

        this.clearState();

        // Cache mutator pipelines so that they can run as a single function.
        this.compileCasts();

        this.assign(attributes);
    }


    clearState() {

        Vue.set(this, '_attributes', {});
        Vue.set(this, '_reference', {});
        Vue.set(this, '_casts', {});

    }

    identifier() {
        return this.saved(this.getOption('identifier'));
    }


    /** Empty representation of the model **/
    defaults() {
        return {};
    }

    relationships() {
        return {};
    }

    routes() {
        return {};
    }


    /**
     *
     * @param {String|Array} relationship
     *
     */
    load(relationship) {

        if(isArray(relationship)) {
            return relationship.map(rel => this.load(rel));
        }

        let route = this.routes()[relationship];

        if(!route) {
            return;
        }

        return store.dispatch(route, this);
    }



    /**
     * Returns the default options for this model.
     *
     * @returns {Object}
     */
    getDefaultOptions() {
        return merge({}, {

            // The attribute that should be used to uniquely identify this model.
            identifier: 'id',

            // Whether this model should allow an existing identifier to be
            // overwritten on update.
            overwriteIdentifier: false,

            // Whether this model should mutate a property as it is changed,
            // before it is set. This is a rare requirement because you usually
            // don't  want to mutate something that you are busy editing.
            castOnChange: false,

            // Whether this model should mutate all attributes before they are
            // synced to the "saved" state. This would include construction,
            // and on assign.
            castBeforeSync: true,
        });
    }

    /**
     * Assigns all given model data to the model's attributes and reference.
     * This will also fill any gaps using the model's default attributes.
     *
     * @param {Object} attributes
     *
     * @returns {Object} The attributes that were assigned to the model.
     */
    assign(attributes) {
        this.set(defaults({}, attributes, cloneDeep(this.defaults())));
        this.sync();
    }

    /**
     * Resets all attributes back to their reference values (source of truth).
     * A good use case for this is when form fields are bound directly to the
     * model's attributes. Changing values in the form fields will change the
     * attributes on the model. On cancel, you can revert the model back to
     * its saved, original state using reset().
     *
     * You can also pass one or an array of attributes to reset.
     *
     * @param {string|string[]} attribute
     */
    reset(attribute) {

        // Reset specific attributes.
        if (attribute) {
            copyFrom(this._reference, this._attributes, castArray(attribute));

            // Reset all attributes if one or more specific ones were not given.
        } else {
            copyFrom(this._reference, this._attributes);
        }

        this.clearErrors();
        this.emit('reset');
    }

    /**
     * @returns {*} The value of an attribute after applying its mutations.
     */
    casted(attribute, value) {
        let cast = get(this._casts, attribute);

        if (cast) {
            return cast(value);
        }

        return value;
    }

    /**
     * Mutates either specific attributes or all attributes if none provided.
     * @param {string|string[]|undefined} attribute
     */
    cast(attribute) {
        if (isUndefined(attribute)) {
            each(this._attributes, (value, attribute) => {
                Vue.set(this._attributes, attribute, this.casted(attribute, value));
            });

            // Only mutate specific attributes.
        } else {
            each(castArray(attribute), (attribute) => {
                let current = this.get(attribute);
                let casted = this.casted(attribute, current);

                Vue.set(this._attributes, attribute, casted);
            });
        }
    }

    /**
     * Sync the current attributes to the reference attributes. This is usually
     * only called on save. We have to clone the values otherwise we
     * end up with references to the same object in both attribute sets.
     *
     * You can also pass one or an array of attributes to sync.
     *
     * @param {string|string[]} attribute
     */
    sync(attribute) {

        // Mutate all attributes before we sync them, if required to do so.
        if (this.getOption('castBeforeSync')) {
            this.cast(attribute);
        }

        // We're cloning deep to avoid multiple references to the same object,
        // otherwise updating the attributes will also update the reference.
        // Set each saved attribute to its active equivalent.
        let active = cloneDeep(this._attributes);

        // Sync either specific attributes or all attributes if none provided.
        if (isUndefined(attribute)) {
            Vue.set(this, '_reference', active);

        } else {
            each(castArray(attribute), (attribute) => {
                Vue.set(this._reference, attribute, get(active, attribute));
            });
        }

        this.emit('sync');
    }


    /**
     * Registers an attribute on this model so that it can be accessed directly
     * on the model, passing through `get` and `set`.
     */
    registerAttribute(attribute) {

        // Protect against unwillingly using an attribute name that already
        // exists as an internal property or method name.
        if (has(RESERVED, attribute)) {
            throw new Error(`Can't use reserved attribute name '${attribute}'`);
        }

        // Create dynamic accessors and mutations so that we can update the
        // model directly while also keeping the model attributes in sync.
        Object.defineProperty(this, attribute, {
            get: ()      => this.get(attribute),
            set: (value) => this.set(attribute, value),
        });
    }

    /**
     * Sets the value of an attribute and registers the magic "getter" in a way
     * that is compatible with Vue's reactivity. This method should always be
     * used when setting the value of an attribute.
     *
     * @param  {string|Object}  attribute
     * @param  {*}              value
     *
     * @returns {*} The value that was set.
     */
    set(attribute, value) {

        // Allow batch set of multiple attributes at once, ie. set({...});
        if (isPlainObject(attribute)) {
            each(attribute, (value, key) => {
                this.set(key, value);
            });

            return;
        }

        if(this.hasRelationship(attribute)) {
            return this.setRelationship(attribute, value);
        } else if(attribute === 'abilities') {
            console.log(this.relationships(), attribute, value);
        }

        let defined = this.has(attribute);

        // Only register the pass-through property if it's not already set up.
        // If it already exists on the instance, we know it has been.
        if ( ! defined) {
            this.registerAttribute(attribute);
        }

        // Current value of the attribute, or `undefined` if not set
        let previous = this.get(attribute);

        // Run the attribute's mutations if required to do so on change.
        if (this.getOption('castOnChange')) {
            value = this.casted(attribute, value);
        }

        Vue.set(this._attributes, attribute, value);

        // Only consider a change if the attribute was already defined.
        let changed = defined && ! isEqual(previous, value);

        if (changed) {

            // Emit the change event after
            this.emit('change', {attribute, previous, value});
        }

        return value;
    }

    setRelationship(relationship, value) {

        let defined = this.has(relationship);

        // Only register the pass-through property if it's not already set up.
        // If it already exists on the instance, we know it has been.
        if ( ! defined) {
            this.registerAttribute(relationship);
        }

        // Current value of the attribute, or `undefined` if not set
        let previous = this.get(relationship);
        var Model = this.relationships()[relationship];


        var collection = value;
        if(isArray(value)) {
            collection = new Collection(value, {
                model: Model
            });
        }

        Vue.set(this._attributes, relationship, collection);

        // Emit the change event after
        this.emit('relationshipUpdated', {relationship, previous, collection});

        return collection;
    }

    /**
     * Reverts all attributes back to their defaults, or `undefined` if a
     * default value is not defined.
     *
     * You can also pass one or an array of attributes to unset.
     *
     * @param {string|string[]} attribute
     */
    unset(attribute) {

        // We're cloning deep to avoid multiple references to the same object,
        // otherwise updating the attributes will also update the reference.
        let defaults = cloneDeep(this.defaults());

        // Unset either specific attributes or all attributes if none provided.
        let attributes = defaultTo(attribute, keys(this._attributes));

        // Unset either specific attributes or all attributes if none provided.
        each(castArray(attributes), (attribute) => {
            if (this.has(attribute)) {
                Vue.set(this._attributes, attribute, get(defaults, attribute));
            }
        });
    }

    /**
     * Similar to `saved`, returns an attribute's value or a fallback value
     * if this model doesn't have the attribute.
     *
     * @param {string} attribute
     * @param {*}      fallback
     *
     * @returns {*} The value of the attribute or `fallback` if not found.
     */
    get(attribute, fallback) {
        return get(this._attributes, attribute, fallback);
    }

    /**
     * Similar to `get`, but accesses the saved attributes instead.
     *
     * This is useful in cases where you want to display an attribute but also
     * change it. For example, a modal with a title based on a model field, but
     * you're also editing that field. The title will be updating reactively if
     * it's bound to the active attribute, so bind to the saved one instead.
     *
     * @param {string} attribute
     * @param {*}      fallback
     *
     * @returns {*} The value of the attribute or `fallback` if not found.
     */
    saved(attribute, fallback) {
        return get(this._reference, attribute, fallback);
    }

    /**
     * Determines if the model has an attribute.
     *
     * @param  {string}  attribute
     * @returns {boolean} `true` if an attribute exists, `false` otherwise.
     *                   Will return true if the object exists but is undefined.
     */
    has(attribute) {
        return has(this._attributes, attribute);
    }


    hasRelationship(attribute) {
        let relationships = keys(this.relationships());
        return relationships.indexOf(attribute) !== -1;
    }


    casts() {
        return {};
    }

    compileCasts() {
        this._casts = mapValues(this.casts(), (m) => flow(m).bind(this));
    }

    toJSON() {
        return this._attributes;
    }

    dateFormat() {
        return 'MM/DD/YYYY'
    }

    parseDate(value) {
        return moment(value).format(this.dateFormat());
    }

}

export default Model;
