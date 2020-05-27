import Vue             from 'vue'
import Base            from './base'
import Model           from './models/model'
import countBy         from 'lodash/countBy'
import defaultsDeep    from 'lodash/defaultsDeep'
import each            from 'lodash/each'
import every           from 'lodash/every'
import filter          from 'lodash/filter'
import find            from 'lodash/find'
import findIndex       from 'lodash/findIndex'
import first           from 'lodash/first'
import get             from 'lodash/get'
import has             from 'lodash/has'
import isArray         from 'lodash/isArray'
import isEmpty         from 'lodash/isEmpty'
import isFunction      from 'lodash/isFunction'
import isNil           from 'lodash/isNil'
import isObject        from 'lodash/isObject'
import isPlainObject   from 'lodash/isPlainObject'
import join            from 'lodash/join'
import keyBy           from 'lodash/keyBy'
import last            from 'lodash/last'
import map             from 'lodash/map'
import max             from 'lodash/max'
import merge           from 'lodash/merge'
import method          from 'lodash/method'
import reduce          from 'lodash/reduce'
import set             from 'lodash/set'
import size            from 'lodash/size'
import sortBy          from 'lodash/sortBy'
import sumBy           from 'lodash/sumBy'
import toSafeInteger   from 'lodash/toSafeInteger'
import unset           from 'lodash/unset'
import values          from 'lodash/values'

/**
 * Used as a marker to indicate that pagination is not enabled.
 */
const NO_PAGE = null;

/**
 * Used as a marker to indicate that a collection has paged through all results.
 */
const LAST_PAGE = 0;

/**
 * Base collection class.
 */
class Collection extends Base {

    /**
     * Accessor to support Array.length semantics.
     */
    get length() {
        return this.size();
    }

    /**
     * Creates a new instance, called when using 'new'.
     *
     * @param  {Array}  [models]    Models to add to this collection.
     * @param  {Object} [options]   Extra options to set on this collection.
     */
    constructor(models = [], options = {}, attributes = {}) {
        super(options);

        Vue.set(this, 'models', []);      // Model store.
        Vue.set(this, '_attributes', {}); // Property store.
        Vue.set(this, '_registry', {});   // Model registry.
        Vue.set(this, '_id_registry', {});
        Vue.set(this, '_current', 0);
        Vue.set(this, '_isPaginating', false);
        Vue.set(this, '_page', null);
        Vue.set(this, '_from', null);
        Vue.set(this, '_to', null);
        Vue.set(this, '_per_page', null);
        Vue.set(this, '_last_page', null);
        Vue.set(this, '_total', null);

        this.clearState();

        // Set all given attributes.
        this.set(defaultsDeep({}, attributes, this.defaults()));

        // Add all given models (if any) to this collection. We explicitly ask
        // for the values here as it's common for some sources to be objects.
        if(models && this.dataIsPaginated(models)) {
            this.setPagination(models);
            this.add(models.data);
        }else if(models && this.attributesIsPaginated(attributes) ) {
            this.setPagination(attributes);
            this.add(values(models));
        }else if (models) {
            this.add(values(models));
        }

        Object.defineProperty(this, 'length', {
            get: ()      => this.models.length,
            set: (value) => value
        });

    }


    /**
     * Add Iterating support
     *
     * @returns {Collection}
     */
    [Symbol.iterator]() {
        this._current = 0;
        return this;
    }

    next() {
        if(this.length === 0 || this._current >= this.length) {
            return { done: true }
        }

        let value = this.models[this._current];
        this._current++;
        return {
            done: false,
            value
        }
    }


    /**
     * Creates a copy of this collection. Model references are preserved so
     * changes to the models inside the clone will also affect the subject.
     *
     * @returns {Collection}
     */
    clone() {
        return new (this.constructor)
        (this.getModels(), this.getOptions(), this.getAttributes());
    }

    /**
     * @return {Model} The class/constructor for this collection's model type.
     */
    model() {
        return this.getOption('model');
    }

    /**
     * @return {Object} Default attributes
     */
    defaults() {
        return {};
    }

    /**
     * @return {*} The value of an attribute, or a given fallback if not set.
     */
    get(attribute, fallback) {
        return get(this._attributes, attribute, fallback);
    }

    /**
     * Sets an attribute's value, or an object of attributes.
     *
     * @param {string|Object} attribute
     * @param {*}             value
     */
    set(attribute, value) {
        if (isPlainObject(attribute)) {
            each(attribute, (value, key) => {
                this.set(key, value);
            });

            return;
        }

        Vue.set(this._attributes, attribute, value);
    }

    /**
     * @return {Object}
     */
    getAttributes() {
        return this._attributes;
    }

    /**
     * @return {Model[]}
     */
    getModels() {
        return this.models;
    }

    /**
     * Returns the default options for this model.
     *
     * @returns {Object}
     */
    getDefaultOptions() {
        return merge(super.getDefaultOptions(), {

            // The class/constructor for this collection's model type.
            model: Model,

        });
    }

    /**
     * @returns {Object} Parameters to use for replacement in route patterns.
     */
    getRouteParameters() {
        return merge({}, super.getRouteParameters(), this._attributes, {
            page: this._page,
        });
    }

    /**
     * Removes all errors from the models in this collection.
     */
    clearErrors() {
        each(this.models, method('clearErrors'));
    }

    /**
     * Resets model state, ie. `loading`, etc back to their initial states.
     */
    clearState() {
        Vue.set(this, 'loading',  false);
        Vue.set(this, '_page', null);
        Vue.set(this, '_from', null);
        Vue.set(this, '_to', null);
        Vue.set(this, '_per_page', null);
        Vue.set(this, '_last_page', null);
        Vue.set(this, '_total', null);
    }

    /**
     * Removes all models from this collection.
     */
    clearModels() {
        let models = this.models;

        // Clear the model store, but keep a reference.
        Vue.set(this, 'models', []);

        // Notify each model that it has been removed from this collection.
        each(models, (model) => {
            this.onRemove(model);
        });
    }

    /**
     * Removes all models from this collection.
     */
    clear() {
        this.clearModels();
        this.clearState();
    }

    /**
     * Syncs all models in this collection. This method delegates to each model
     * so follows the same signature and effects as `Model.sync`.
     */
    sync() {
        each(this.models, method('sync'));
    }

    /**
     * Resets all models in this collection. This method delegates to each model
     * so follows the same signature and effects as `Model.reset`.
     *
     * @param {string|string[]} attribute
     */
    reset(...attribute) {
        each(this.models, method('reset', ...attribute));
    }

    /**
     * Returns the number of models in this collection.
     */
    size() {
        if(this._isPaginating) { // if we're paginating, technically the size of the entire collection is the total records from the pagination
            return this._total;
        }
        return size(this.models);
    }

    /**
     * @returns {boolean} `true` if the collection is empty, `false` otherwise.
     */
    isEmpty() {
        return this.size() === 0;
    }

    /**
     * @returns {Object} A native representation of this collection that will
     *                   determine the contents of JSON.stringify(collection).
     */
    toJSON() {
        return this.models;
    }

    /**
     * @returns {Promise}
     */
    validate() {
        let validations = this.models.map((model) => model.validate());

        return Promise.all(validations).then((errors) => {
            return every(errors, isEmpty) ? [] : errors;
        });
    }

    /**
     * Create a new model of this collection's model type.
     *
     * @param {Object} attributes
     *
     * @returns {Model} A new instance of this collection's model.
     */
    createModel(attributes) {
        return new (this.model())(attributes);
    }

    /**
     * Removes a model from the model registry.
     *
     * @param {Model} model
     */
    removeModelFromRegistry(model) {
        unset(this._registry, model._uid);
        if(model.id) {
            unset(this._id_registry, model.id);
        }
    }

    /**
     * @return {Boolean} true if this collection has the model in its registry.
     */
    hasModelInRegistry(model) {
        let hasInRegistry = has(this._registry, model._uid);
        var hasInIdRegistry = false;
        if(model.id) {
            hasInIdRegistry = has(this._id_registry, model.id);
        }

        if(hasInRegistry || hasInIdRegistry) {
            return true;
        }

        return false;
    }

    /**
     * Adds a model from the model registry.
     *
     * @param {Model} model
     */
    addModelToRegistry(model) {
        Vue.set(this._registry, model._uid, 1);
        if(model.id) {
            Vue.set(this._id_registry, model.id, 1);
        }
    }

    /**
     * Called when a model has been added to this collection.
     *
     * @param {Model} model
     */
    onAdd(model) {
        this.addModelToRegistry(model);

        if(this._isPaginating) {
            this._total += 1;
        }

        this.emit('add', {model});
    }

    /**
     * Adds a model to this collection.
     *
     * This method returns a single model if only one was given, but will return
     * an array of all added models if an array was given.
     *
     * @param {Model|Array|Object} model Adds a model instance or plain object,
     *                                   or an array of either, to this collection.
     *                                   A model instance will be created and
     *                                   returned if passed a plain object.
     *
     * @returns {Model|Array} The added model or array of added models.
     */
    add(model = {}) {

        // If given an array, assume an array of models and add them all.
        if (isArray(model)) {
            return model.map( m => {
                this.add(m);
            })
        }

        // Objects should be converted to model instances first, then added.
        if (isPlainObject(model)) {
            return this.add(this.createModel(model));
        }

        // This is also just to catch a potential bug. All models should have
        // an auto id so this would indicate an unexpected state.
        if ( ! this.isModel(model)) {
            throw new Error('Expected a model, plain object, or array of either');
        }

        // Make sure we don't add the same model twice.
        if (this.hasModelInRegistry(model)) {
            return;
        }

        // Add the model instance to this collection.
        this.models.push(model);
        this.onAdd(model);

        return model;
    }

    /**
     * Called when a model has been removed from this collection.
     *
     * @param {Model} model
     */
    onRemove(model) {
        this.removeModelFromRegistry(model);
        this.emit('remove', {model });
    }

    /**
     * Removes a model at a given index.
     *
     * @param  {number} index

     * @returns {Model} The model that was removed, or `undefined` if invalid.
     * @throws  {Error} If a model could not be found at the given index.
     */
    _removeModelAtIndex(index) {
        if (index < 0) {
            return;
        }

        let model = get(this.models, index);
        Vue.delete(this.models, index);
        this.onRemove(model);

        return model;
    }

    /**
     * Removes a `Model` from this collection.
     *
     * @param  {Model} model
     *
     * @return {Model}
     */
    _removeModel(model) {
        return this._removeModelAtIndex(this.indexOf(model));
    }

    /**
     * Removes the given model from this collection.
     *
     * @param  {Model|Object|Array} model Model to remove, which can be a `Model`
     *                                    instance, an object to filter by,
     *                                    a function to filter by, or an array
     *                                    of any of the above to remove multiple.
     *
     * @return {Model|Model[]} The deleted model or an array of models if a filter
     *                         or array type was given.
     *
     * @throws {Error} If the model is an invalid type.
     */
    remove(model) {
        if ( ! model) {
            throw new Error('Expected function, object, array, or model to remove');
        }

        // Support using a predicate to remove all models it returns true for.
        // Alternatively support an object of values to filter by.
        if (isFunction(model) || isPlainObject(model)) {
            return this.remove(filter(this.models, model));
        }

        // Support removing multiple models at the same time if an array was
        // given. A model would otherwise always be an object so this is safe.
        if (isArray(model)) {
            return model.map(m => this.remove(m))
            //return filter(map(model, this.remove));
        }

        // This is just to catch a potential bug. All models should have
        // an auto id here so this would indicate an unexpected state.
        if ( ! this.isModel(model)) {
            throw new Error('Model to remove is not a valid model');
        }

        return this._removeModel(model);
    }

    /**
     * Determines whether a given value is an instance of a model.
     *
     * @param  {*} candidate A model candidate
     *
     * @return {boolean} `true` if the given `model` is an instance of Model.
     */
    isModel(candidate) {
        return isObject(candidate)
            && has(candidate, '_attributes')
            && has(candidate, '_uid');
    }

    /**
     * Returns the zero-based index of the given model in this collection.
     *
     * @see {@link https://lodash.com/docs/#findIndex}
     *
     * @return {number} the index of a model in this collection, or -1 if not found.
     */
    indexOf(model) {
        let filter = model;

        // Getting the index of a model instance can be optimised.
        if (this.isModel(filter)) {

            // Constant time check, if the registry doesn't have a record of
            // the model, we know it's not in the collection.
            if ( ! has(this._registry, model._uid)) {
                return -1;
            }

            // There is no need to filter on the entire object, because the
            // unique ID of the model is all we need to identify it.
            filter = {_uid: model._uid };
        }

        return findIndex(this.models, filter);
    }

    /**
     * @param {string|function|Object} where
     *
     * @return {Model} The first model that matches the given criteria, or
     *                 `undefined` if none could be found.
     *
     * @see {@link https://lodash.com/docs/#find}
     */
    find(where) {
        return find(this.models, where);
    }

    /**
     * Creates a new collection of the same type that contains only the models
     * for which the given predicate returns `true` for, or matches by property.
     *
     * @see {@link where}
     *
     * Important: Even though this returns a new collection, the references to
     *            each model are preserved, so changes will propagate to both.
     *
     * @param {function|Object|string} predicate Receives `model`.
     *
     * @returns {Collection}
     */
    filter(predicate) {
        let result = this.clone();

        result.models = filter(result.models, predicate);
        return result;
    }

    /**
     * Returns the models for which the given predicate returns `true` for,
     * or models that match attributes in an object.
     *
     * @see {@link https://lodash.com/docs/#filter}
     *
     * @param {function|Object|string} predicate Receives `model`.
     *
     * @returns {Model[]}
     */
    where(predicate) {
        return filter(this.models, predicate);
    }

    /**
     * Returns an array that contains the returned result after applying a
     * function to each model in this collection.
     *
     * @see {@link https://lodash.com/docs/#map}
     *
     * @param {function} callback Receives `model`.
     *
     * @return {Model[]}
     */
    map(callback) {
        return map(this.models, callback);
    }

    /**
     * Iterates through all models, calling a given callback for each one.
     *
     * @see {@link https://lodash.com/docs/#each}
     *
     * @param {function} callback Receives `model` and `index`.
     */
    each(callback) {
        return each(this.models, callback);
    }

    forEach(callback) {
        return this.each(callback);
    }

    /**
     * Reduces this collection to a value which is the accumulated result of
     * running each model through `iteratee`, where each successive invocation
     * is supplied the return value of the previous.
     *
     * If `initial` is not given, the first model of the collection is used
     * as the initial value.
     *
     * @param {function} iteratee Invoked with three arguments:
     *                            (result, model, index)
     *
     * @param {*} [initial] The initial value to use for the `result`.
     *
     * @returns {*} The final value of result, after the last iteration.
     */
    reduce(iteratee, initial) {

        // Use the first model as the initial value if an initial was not given.
        if (arguments.length === 1) {
            initial = this.first();
        }

        return reduce(this.models, iteratee, initial);
    }

    /**
     * @param {function|string} iteratee Attribute name or callback to determine
     *                                   which values to sum by. Invoked with a
     *                                   single argument `model`.
     *
     * @returns {number} Sum of all models, accessed by attribute or callback.
     */
    sum(iteratee) {
        return sumBy(this.models, iteratee);
    }

    /**
     * Returns an object composed of keys generated from the results of running
     * each model through `iteratee`. The corresponding value of each key is the
     * number of times the key was returned by iteratee.
     *
     * @see {@link https://lodash.com/docs/#countBy}
     *
     * @returns {Object}
     */
    count(iteratee) {
        return countBy(this.models, iteratee);
    }

    /**
     * Sorts this collection's models using a comparator. This method performs
     * a stable sort (it preserves the original sort order of equal elements).
     *
     * @see {@link https://lodash.com/docs/#sortBy}
     *
     * @param {function|string} comparator Attribute name or attribute function,
     *                                     invoked with a single arg `model`.
     */
    sort(comparator) {
        Vue.set(this, 'models', sortBy(this.models, comparator));
    }

    /**
     * @param {Model|Object} model
     *
     * @returns {boolean} `true` if this collection contains the given model,
     *                    `false` otherwise.
     */
    has(model) {
        return this.indexOf(model) >= 0;
    }

    /**
     * @returns {Model|undefined} The first model of this collection.
     */
    first() {
        return first(this.models);
    }

    /**
     * @returns {Model|undefined} The last model of this collection.
     */
    last() {
        return last(this.models);
    }

    /**
     * Removes and returns the first model of this collection, if there was one.
     *
     * @returns {Model|undefined} Removed model or undefined if there were none.
     */
    shift() {
        if ( ! this.isEmpty()) {
            return this._removeModelAtIndex(0);
        }
    }

    /**
     * Removes and returns the last model of this collection, if there was one.
     *
     * @returns {Model|undefined} Removed model or undefined if there were none.
     */
    pop() {
        if ( ! this.isEmpty()) {
            return this._removeModelAtIndex(this.size() - 1);
        }
    }

    /**
     * Replaces all models in this collection with those provided. This is
     * effectively equivalent to `clear` and `add`, and will result in an empty
     * collection if no models were provided.
     *
     * @param {Model|Model[]} models Models to replace the current models with.
     */
    replace(models) {
        this.clearModels();
        this.add(values(models));
    }

    /**
     * @returns {boolean} Whether the data is currently paginated.
     */
    dataIsPaginated(data) {
        return data.current_page !== null && typeof data.current_page !== 'undefined';
    }

    attributesIsPaginated(attributes) {

        if(!attributes) {
            return false;
        }

        return attributes.current_page !== null && typeof attributes.current_page !== 'undefined';
    }

    /**
     * @returns {integer|null} The page that this collection is on.
     */
    getPage() {
        return this._page;
    }

    /**
     * @returns {boolean} Whether this collection is on the last page,
     *                            ie. there won't be more results that follow.
     */
    isLastPage() {
        return this._page === this._last_page;
    }

    /**
     * Responsible for adjusting the page and appending of models that were
     * received by a paginated fetch request.
     *
     * @param {[]} data
     */
    setPagination(data) {

        Vue.set(this, '_isPaginating', true);

        this.set( 'page', data.current_page);
        this.set('from', data.from);
        this.set('to', data.to);
        this.set('per_page', data.per_page);
        this.set('last_page', data.last_page);
        this.set('total', data.total);
    }

    /**
     * Collect all model identifiers.
     *
     * @returns {Array}
     */
    getIdentifiers(models) {
        return map(models, method('identifier'));
    }


    /**
     * Convert collection to Array. All models inside are converted to JSON
     *
     * @return {object[]} converted collection
     */
    toArray() {
        return this.map(model => model.toJSON());
    }

    /**
     * Convert collection to an array if we're not paginating, or returns a laravel-like pagination object for use in something like v-grid
     *
     * @returns {{per_page: *, total: *, data: (string|Collection), last_page: *, from: *, to: *, current_page: number}|*}
     */
    paginate() {

        if(!this._isPaginating) {
            return this.models;
        }

        return {
            current_page: this.get('page'),
            data: this.models,
            from: this.get('from'),
            to: this.get('to'),
            per_page: this.get('per_page'),
            last_page: this.get('las_page'),
            total: this.get('total')
        }
    }
}

export default Collection;
