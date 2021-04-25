import {Base} from "./base";
import {Collection} from "./collection";
import {DateTime, LocaleOptions} from "luxon";
import {reactive, isReactive, toRaw} from "vue";

import castArray from "lodash/castArray";
import cloneDeep from "lodash/cloneDeep";
import each from "lodash/each";
import flow from "lodash/flow";
import get from "lodash/get";
import has from "lodash/has";
import isPlainObject from "lodash/isPlainObject";
import isUndefined from "lodash/isUndefined";
import keys from "lodash/keys";
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";
import invert from "lodash/invert";
import defaults from "lodash/defaults";


const RESERVEDKEYS = invert([
    '_attributes',
    '_casts',
    '_collections',
    '_errors',
    '_listeners',
    '_reference',
    '_uid',
    'attributes'
])


export class Model extends Base {
    public id: number;
    private _reference: Record<string, any>;
    public _attributes: Record<string, any>;
    private _casts: Record<string, any>;
    private _registeredAttributes: string[];
    private _current: number = 0;
    private _reserved: Array<string> = [
        "_attributes",
        "_casts",
        "_collections",
        "_errors",
        "_listeners",
        "_reference",
        "_uid",
        "attributes"
    ];

    constructor(
        attributes: Record<string, any> | Model,
        options?: Record<string, any>
    ) {
        super(options);

        this.id = 0;
        this._reference = reactive({});
        this._attributes = reactive({});
        this._casts = {};
        this._registeredAttributes = [];

        // Cache mutator pipelines so that they can run as a single function.
        this.compileCasts();
        this.assign(attributes);
    }

    identifier() {
        return this.saved(this.getOption("identifier"));
    }

    relationships(): Record<string, typeof Model> {
        return {};
    }

    getAttributes() {
        return this._attributes;
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
        if (
            Object.keys(this._attributes).length === 0 ||
            this._current >= Object.keys(this._attributes).length
        ) {
            return {done: true};
        }

        const key = Object.keys(this._attributes)[this._current];

        const value = this._attributes[key];
        this._current++;
        return {
            done: false,
            value
        };
    }

    /**
     * Returns the default options for this model.
     *
     * @returns {Object}
     */
    getDefaultOptions() {
        return merge(
            {},
            {
                // The attribute that should be used to uniquely identify this model.
                identifier: "id",

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
                castBeforeSync: true
            }
        );
    }

    /**
     * Determines whether a given value is an instance of a model.
     *
     * @param  {*} candidate A model candidate
     *
     * @return {boolean} `true` if the given `model` is an instance of Model.
     */
    isModel(candidate: any): boolean {
        return candidate instanceof Model;
    }

    /**
     * Assigns all given model data to the model's attributes and reference.
     * This will also fill any gaps using the model's default attributes.
     *
     * @param {Object} attributes
     *
     * @returns {Object} The attributes that were assigned to the model.
     */
    assign(attributes: Record<string, any> | Model): void {
        if (attributes instanceof Model) {
            attributes = attributes.getAttributes();
        }

        this.set(defaults({}, attributes));
        this.sync();
    }

    ensureAttributesAreRegistered(properties: string[]) {
        properties.forEach(prop => {
            // Protect against unwillingly using an attribute name that already
            // exists as an internal property or method name.
            if (has(RESERVEDKEYS, prop)) {
                throw new Error(`Can't use reserved attribute name '${prop}'`);
            }

            if (this._registeredAttributes.indexOf(prop) !== -1) {
                return; // attribute is registered
            }

            /** @ts-ignore **/
            this.set(prop, this[prop]);
        });
    }


    removeParentPropertyNames(properties: string[]): string[] {
        return properties.filter(prop => prop.indexOf('_') !== 0);
    }


    /**
     * @returns {*} The value of an attribute after applying its mutations.
     */
    casted(attribute: string, value: any): any {
        const cast = get(this._casts, attribute);

        if (cast) {
            return cast(value);
        }

        return value;
    }

    /**
     * Mutates either specific attributes or all attributes if none provided.
     * @param {string|string[]|undefined} attribute
     */
    cast(attribute?: string | string[]): void {
        if (isUndefined(attribute)) {
            each(this._attributes, (value, attribute) => {
                this._attributes[attribute] = this.casted(attribute, value);
            });
        } else {
            // Only mutate specific attributes.
            each(castArray(attribute), attribute => {
                this._attributes[attribute] = this.casted(
                    attribute,
                    this.get(attribute)
                );
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
    sync(attribute?: string | string[]) {
        // Mutate all attributes before we sync them, if required to do so.
        if (this.getOption("castBeforeSync")) {
            this.cast(attribute);
        }

        // We're cloning deep to avoid multiple references to the same object,
        // otherwise updating the attributes will also update the reference.
        // Set each saved attribute to its active equivalent.
        let attributes = this._attributes;
        if (isReactive(this._attributes)) {
            attributes = toRaw(this._attributes);
        }

        const active = cloneDeep(attributes);

        // Sync either specific attributes or all attributes if none provided.
        if (isUndefined(attribute)) {
            this._reference = reactive(active);
        } else {
            // otherwise set specific ones, _reference is already reactive from constructor
            each(castArray(attribute), attribute => {
                this._reference[attribute] = get(active, attribute);
            });
        }
    }

    /**
     * Registers an attribute on this model so that it can be accessed directly
     * on the model, passing through `get` and `set`.
     */
    registerAttribute(attribute: string): void {
        // Protect against unwillingly using an attribute name that already
        // exists as an internal property or method name.
        if (has(RESERVEDKEYS, attribute)) {
            throw new Error(`Can't use reserved attribute name '${attribute}'`);
        }

        if (this._registeredAttributes.indexOf(attribute) !== -1) {
            return; // attribute is registered
        }

        // Create dynamic accessors and mutations so that we can update the
        // model directly while also keeping the model attributes in sync.
        Object.defineProperty(this, attribute, {
            get: () => this.get(attribute),
            set: value => this.set(attribute, value)
        });

        this._registeredAttributes.push(attribute);
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
    set(attribute: string | { [key: string]: any }, value?: any) {
        // Allow batch set of multiple attributes at once, ie. set({...});
        if (isPlainObject(attribute) && typeof attribute !== "string") {

            each(attribute, (value: any, key: string) => {
                this.set(key, value);
            });

            return;
        }

        if (typeof attribute !== "string") {
            // typescript catch for if the attribute wasn't a plain object and also not a string
            return;
        }

        if (this._reserved.indexOf(attribute) !== -1) {
            throw new Error("Invalid attribute to set on model");
        }

        if (this.hasRelationship(attribute)) {
            this.ensureRelationshipIsSet(attribute);
            return this.setRelationship(attribute, value);
        }

        this.registerAttribute(attribute);

        // Run the attribute's mutations if required to do so on change.
        if (this.getOption("castOnChange")) {
            value = this.casted(attribute, value);
        }

        this._attributes[attribute] = value;

        return value;
    }

    setRelationship(
        relationship: string,
        value: Record<string, any>[] | Collection<Model>
    ) {
        if (!this.has(relationship)) {
            this.registerAttribute(relationship);
        }

        if (value instanceof Collection) {
            // value already a collection
            this._attributes[relationship] = value;
        } else {

            const relationshipModel = this.relationships()[relationship] as typeof Model;

            this._attributes[relationship] = new Collection(
                value,
                {
                    model: relationshipModel
                }
            );
        }

        return this._attributes[relationship];
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
    get(attribute: string, fallback?: any) {
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
    saved(attribute: string, fallback?: any) {
        return get(this._reference, attribute, fallback);
    }

    /**
     * Determines if the model has an attribute.
     *
     * @param  {string}  attribute
     * @returns {boolean} `true` if an attribute exists, `false` otherwise.
     *                   Will return true if the object exists but is undefined.
     */
    has(attribute: string): boolean {
        return has(this._attributes, attribute);
    }

    hasRelationship(attribute: string): boolean {
        const relationships: string[] = keys(this.relationships());
        return relationships.indexOf(attribute) !== -1;
    }

    casts(): Record<string, any> {
        return {};
    }

    compileCasts(): void {
        this._casts = mapValues(this.casts(), m => flow(m).bind(this));
    }

    toJSON(): Record<string, any> {
        return this._attributes;
    }

    dateFormat(): LocaleOptions | Intl.DateTimeFormatOptions {
        return DateTime.DATE_SHORT;
    }

    parseDate(value: string) {
        return DateTime.fromSQL(value).toLocaleString(this.dateFormat());
    }

    ensureRelationshipIsSet(relationship: string) {
        const rel = get(this, relationship);

        if (rel !== null && typeof rel !== "undefined") {
            return;
        }

        const relationshipModel = this.relationships()[relationship];

        if (!relationshipModel) {
            throw new Error(
                "Invalid relationship model defined by relationships method"
            );
        }

        const relationshipCollection = new Collection([], {
            model: relationshipModel
        });

        this.registerAttribute(relationship);
        this._attributes[relationship] = relationshipCollection;
    }
}

export default Model;
