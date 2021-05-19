import {toRaw} from "vue";
import Base from "./base";
import Model from "./model";
import Generic from "./../classes/models/generic";
import defaultsDeep from "lodash/defaultsDeep";
import each from "lodash/each";
import filter from "lodash/filter";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import get from "lodash/get";
import has from "lodash/has";
import isObject from "lodash/isObject";
import isPlainObject from "lodash/isPlainObject";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import merge from "lodash/merge";
import size from "lodash/size";
import unset from "lodash/unset";
import values from "lodash/values";
import at from "lodash/at";
import {ITypedCollection, ILengthAwarePaginatedResponse, ILengthAwarePaginator} from "./../types/index";

/**
 * Base collection class.
 */
export class Collection<MT extends Model> extends Base
    implements ITypedCollection<MT> {
    public models: MT[];
    private _attributes: Record<string, any>;
    private _registry: Record<string, number>;
    private _id_registry: Record<number, number>;
    private _current: number
    private _isPaginating: boolean
    private _page: number
    private _from: number
    private _to: number
    private _per_page: number
    private _last_page: number
    private _total: number


    /**
     * Creates a new instance, called when using 'new'.
     *
     * @param  {Array}  [models]    Models to add to this collection.
     * @param  {Object} [options]   Extra options to set on this collection.
     * @param {Object} [attributes]
     */
    constructor(
        models: MT[] | Record<string, any>[],
        options?: Record<string, any>,
        attributes?: Record<string, any>
    ) {
        super(options);

        this.models = [];
        this._attributes = {};
        this._registry = {};
        this._id_registry = {};
        this._current = 0
        this._page = 0
        this._from = 0
        this._to = 0
        this._per_page = 0
        this._last_page = 0
        this._total = 0
        this._isPaginating = false

        // Add all given models (if any) to this collection. We explicitly ask
        // for the values here as it's common for some sources to be objects.

        if (models && this.dataIsPaginated(models)) {
            this.setPagination(models)
            /* @ts-ignore */
            this.add(models.data)
        } else if (models && attributes && this.attributesIsPaginated(attributes)) {
            this.setPagination(attributes)
            this.add(values(models))
        } else if (models) {
            this.add(values(models))
        }


        // Set all given attributes.
        this.set(defaultsDeep({}, attributes, this.defaults()));

        Object.defineProperty(this, "length", {
            get: () => this.models.length,
            set: value => value
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
        if (this.length === 0 || this._current >= this.length) {
            return {done: true};
        }

        let value = this.models[this._current];
        this._current++;
        return {
            done: false,
            value
        };
    }

    /**
     * Accessor to support Array.length semantics.
     */
    get length(): number {
        return this.size();
    }

    /**
     * Creates a copy of this collection. Model references are preserved so
     * changes to the models inside the clone will also affect the subject.
     *
     * @returns {Collection}
     */
    clone(): Collection<MT> {
        return new Collection<MT>(
            this.getModels(),
            this.getOptions(),
        )
    }

    /**
     * @return {Model} The class/constructor for this collection's model type.
     */
    model(): typeof Model {
        return this.getOption("model");
    }

    /**
     * @return {Object} Default attributes
     */
    defaults(): Record<string, any> {
        return {};
    }

    /**
     * @return {*} The value of an attribute, or a given fallback if not set.
     */
    get(attribute: string, fallback?: any): any {
        return get(this._attributes, attribute, fallback);
    }

    /**
     * Sets an attribute's value, or an object of attributes.
     *
     * @param {string|Object} attribute
     * @param {*}             value
     */
    set(attribute: string | Record<string, any>, value?: any): void {
        if (
            isPlainObject(attribute) &&
            typeof attribute !== "string" &&
            typeof attribute === "object"
        ) {
            each(attribute, (value, key) => {
                this.set(key, value);
            });

            return;
        } else if (typeof attribute === "string") {
            this._attributes[attribute] = value;
        } else {
            throw Error("Unable to assign attribute");
        }
    }

    /**
     * @return {Model[]}
     */
    getModels(): MT[] {
        return toRaw(this.models);
    }

    /**
     * Returns the default options for this model.
     *
     * @returns {Object}
     */
    getDefaultOptions(): Record<string, any> {
        return merge(super.getDefaultOptions(), {
            model: Generic
        });
    }

    /**
     * Removes all models from this collection.
     */
    clear(): void {
        this.models = [];
        this._registry = {};
        this._id_registry = {};
    }

    /**
     * Returns the number of models in this collection.
     */
    size(): number {
        return size(this.models);
    }

    /**
     * @returns {boolean} `true` if the collection is empty, `false` otherwise.
     */
    isEmpty(): boolean {
        return this.size() === 0;
    }

    /**
     * @returns {Object} A native representation of this collection that will
     *                   determine the contents of JSON.stringify(collection).
     */
    toJSON(): Record<string, any>[] {
        return this.models.map((model) => {
            return model.toJSON();
        });
    }

    /**
     * Create a new model of this collection's model type.
     *
     * @param {Object} attributes
     *
     * @returns {Model} A new instance of this collection's model.
     */
    createModel(attributes: Record<string, any> | MT): MT {
        return new (this.model())(attributes) as MT;
    }

    /**
     * Removes a model from the model registry.
     *
     * @param {Model} model
     */
    removeModelFromRegistry(model: MT): void {
        unset(this._registry, model.getUid());
        unset(this._id_registry, model.id);
    }

    /**
     * @return {Boolean} true if this collection has the model in its registry.
     */
    hasModelInRegistry(model: MT): boolean {
        let hasInRegistry = has(this._registry, model.getUid());
        let hasInIdRegistry = false;
        if (model.id) {
            hasInIdRegistry = has(this._id_registry, model.id);
        }

        return !!(hasInRegistry || hasInIdRegistry);
    }

    /**
     * Adds a model from the model registry.
     *
     * @param {Model} model
     */
    addModelToRegistry(model: MT): void {
        this._registry[model.getUid()] = 1;
        this._id_registry[model.id] = 1;
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
    add(model: MT | MT[] | Record<string, any>): void {
        // If given an array, assume an array of models and add them all.
        if (Array.isArray(model)) {
            model.forEach(m => {
                this.add(m);
            });

            return;
        }

        // Objects should be converted to model instances first, then added.
        if (isPlainObject(model)) {;
            return this.add(this.createModel(model));
        }

        // This is also just to catch a potential bug. All models should have
        // an auto id so this would indicate an unexpected state.
        if (!this.isModel(model)) {
            throw new Error("Expected a model, plain object, or array of either");
        }

        // Make sure we don't add the same model twice.
        // @ts-ignore
        if (this.hasModelInRegistry(model)) {
            console.log('Model in registry', model);
            return;
        }

        this.addModelToRegistry(model as MT);

        // Add the model instance to this collection.
        // @ts-ignore
        this.models.push(model);
    }

    /**
     * Called when a model has been removed from this collection.
     *
     * @param {Model} model
     */
    onRemove(model: MT) {
        this.removeModelFromRegistry(model);
    }

    /**
     * Removes a model at a given index.
     *
     * @param  {number} index

     * @returns {Model} The model that was removed, or `undefined` if invalid.
     * @throws  {Error} If a model could not be found at the given index.
     */
    _removeModelAtIndex(index: number): MT | void {
        if (index < 0) {
            return;
        }

        const model = get(this.models, index);
        this.models.splice(index, 1);
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
    _removeModel(model: MT): MT | void {
        return this._removeModelAtIndex(this.indexOf(model));
    }

    /**
     * Removes the given model from this collection.
     */
    remove(model: MT | number): MT | void {
        if (typeof model === "number") {
            // find the model to remove
            const foundModel = this.models.find(m => {
                return m.id === model;
            });
            if (foundModel) {
                this.remove(foundModel);
            } else {
                throw new Error("Invalid model id to remove");
            }

            return foundModel;
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
    isModel(candidate: any): boolean {
        return isObject(candidate) && candidate instanceof Model;
    }

    /**
     * Returns the zero-based index of the given model in this collection.
     *
     * @see {@link https://lodash.com/docs/#findIndex}
     *
     * @return {number} the index of a model in this collection, or -1 if not found.
     */
    indexOf(model: MT | Record<string, any>): number {
        let filter = {};

        // Getting the index of a model instance can be optimised.
        if (this.isModel(model)) {
            // Constant time check, if the registry doesn't have a record of
            // the model, we know it's not in the collection.
            if (!has(this._id_registry, model.id)) {
                return -1;
            }

            // There is no need to filter on the entire object, because the
            // unique ID of the model is all we need to identify it.
            filter = {id: model.id};
        } else {
            filter = model;
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
    find(where: string | Record<string, any>): MT | undefined {
        return find(this.models, where) as MT;
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
    filter(predicate: Record<string, any> | string): Collection<MT> {
        const result = this.clone();
        result.models = filter(result.models, predicate) as MT[];
        return result;
    }

    /**
     * Create a new collection where the predicate is in the key passed in
     *
     * @param key
     * @param itemsIn
     */
    whereIn(key: string, itemsIn: any): Collection<MT> {
        const result = this.clone();
        result.models = at(keyBy(result.models, key), itemsIn);
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
    where(predicate: Record<string, any> | string): MT[] {
        return filter(this.models, predicate) as MT[];
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
    map(callback: { (m: MT): Record<string, any> | MT | void }) {
        return map(this.models, callback);
    }

    /**
     * Iterates through all models, calling a given callback for each one.
     *
     * @see {@link https://lodash.com/docs/#each}
     *
     * @param {function} callback Receives `model` and `index`.
     */
    each(callback: { (m: MT): void }): void {
        each(this.models, callback);
    }

    /**
     * Symlink for each function
     *
     * @param callback
     */
    forEach(callback: { (m: MT): void }) {
        return this.each(callback);
    }

    first(): MT | null {
        if(this.models.length > 0) {
            return this.models[0];
        }

        return null;
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
     * @returns {boolean} Whether the data is currently paginated.
     */
    dataIsPaginated(data: MT[] | ILengthAwarePaginatedResponse<MT> | Record<string, any>): boolean {
        if (Array.isArray(data)) { // determine if it's an array of model type, if so return false
            return false
        }

        return (
            data.current_page !== null &&
            typeof data.current_page !== 'undefined'
        )
    }

    attributesIsPaginated(attributes?: Record<string, any>): boolean {
        if (!attributes) {
            return false
        }

        return (
            attributes.current_page !== null &&
            typeof attributes.current_page !== 'undefined'
        )
    }

    /**
     * @returns {integer|null} The page that this collection is on.
     */
    getPage() {
        return this._page
    }

    /**
     * @returns {boolean} Whether this collection is on the last page,
     *                            ie. there won't be more results that follow.
     */
    isLastPage() {
        return this._page === this._last_page
    }

    /**
     * Responsible for adjusting the page and appending of models that were
     * received by a paginated fetch request.
     *
     * @param {[]} data
     */
    setPagination(data: Record<string, any>) {
        this._isPaginating = true

        this._page = data.current_page
        this._from = data.from
        this._to = data.to
        this._per_page = data.per_page
        this._last_page = data.last_page
        this._total = data.total
    }

    /**
     * Convert collection to an array if we're not paginating, or returns a laravel-like pagination object for use in something like v-grid
     *
     * @returns {{per_page: *, total: *, data: (string|Collection), last_page: *, from: *, to: *, current_page: number}|*}
     */
    paginate(): ILengthAwarePaginator<MT> | MT[] {
        if (!this._isPaginating) {
            return this.models
        }

        return {
            current_page: this.get('page'),
            data: this.models,
            from: this._from,
            to: this._to,
            per_page: this._per_page,
            last_page: this._last_page,
            total: this._total
        } as ILengthAwarePaginator<MT>
    }
}

export default Collection;
