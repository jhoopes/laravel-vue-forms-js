import Vue              from 'vue'
import defaults         from 'lodash/defaults'
import defaultsDeep     from 'lodash/defaultsDeep'
import defaultTo        from 'lodash/defaultTo'
import each             from 'lodash/each'
import get              from 'lodash/get'
import map              from 'lodash/map'
import set              from 'lodash/set'
import split            from 'lodash/split'
import trim             from 'lodash/trim'
import uniqueId         from 'lodash/uniqueId'

/**
 * Base class for all things common between Model and Collection.
 */
class Base {

    constructor(options) {

        // Define an automatic unique ID. This is primarily to distinguish
        // between multiple instances of the same name and data.
        Object.defineProperty(this, '_uid', {
            value:        uniqueId(),
            enumerable:   false,
            configurable: false,
            writable:     false,
        });

        Vue.set(this, '_listeners', {});  // Event listeners
        Vue.set(this, '_options',   {});  // Internal option store

        this.setOptions(options);
        this.boot();
    }

    /**
     * @returns {string} The class name of this instance.
     */
    get $class() {
        return (Object.getPrototypeOf(this)).constructor.name;
    }

    /**
     * Called after construction, this hook allows you to add some extra setup
     * logic without having to override the constructor.
     */
    boot() {

    }

    /**
     * Returns the default context for all events emitted by this instance.
     *
     * @returns {Object}
     */
    getDefaultEventContext() {
        return {target: this}
    }

    /**
     * @returns {string} Default string representation.
     */
    toString() {
        return `<${this.$class} #${this._uid}>`;
    }

    /**
     * Emits an event by name to all registered listeners on that event.

     * Listeners will be called in the order that they were added. If a listener
     * returns `false`, no other listeners will be called.
     *
     * @param {string} event    The name of the event to emit.
     * @param {Object} context  The context of the event, passed to listeners.
     */
    emit(event, context = {}) {
        let listeners = get(this._listeners, event);

        if ( ! listeners) {
            return;
        }

        // Create the context for the event.
        context = defaults({}, context, this.getDefaultEventContext());

        // Run through each listener. If any of them return false, stop the
        // iteration and mark that the event wasn't handled by all listeners.
        each(listeners, (listener) => listener(context));
    }

    /**
     * Registers an event listener for a given event.
     *
     * Event names can be comma-separated to register multiple events.
     *
     * @param {string}   event      The name of the event to listen for.
     * @param {function} listener   The event listener, accepts context.
     */
    on(event, listener) {
        let events = map(split(event, ','), trim);

        each(events, (event) => {
            this._listeners[event] = this._listeners[event] || [];
            this._listeners[event].push(listener);
        });
    }

    /**
     * @returns {Object} This class' default options.
     */
    getDefaultOptions() {
        return {

        }
    }

    /**
     * @param {Array|string} path     Option path resolved by `get`
     * @param {*}            fallback Fallback value if the option is not set.
     *
     * @returns {*} The value of the given option path.
     */
    getOption(path, fallback = null) {
        return get(this._options, path, fallback);
    }

    /**
     * @returns {Object} This instance's default options.
     */
    instanceOptions() {
        return {}
    }

    /**
     * Sets an option.
     *
     * @param {string} path
     * @param {*}      value
     */
    setOption(path, value) {
        set(this._options, path, value);
    }

    /**
     * Sets all given options. Successive values for the same option won't be
     * overwritten, so this follows the 'defaults' behaviour, and not 'merge'.
     *
     * @param {...Object} options One or more objects of options.
     */
    setOptions(...options) {
        Vue.set(this, '_options', defaultsDeep(
            {},
            ...options,                 // Given options
            this.instanceOptions(),     // Instance defaults
            this.getDefaultOptions()    // Class defaults
        ));
    }

    /**
     * Returns all the options that are currently set on this instance.
     *
     * @return {Object}
     */
    getOptions() {
        return defaultTo(this._options, {});
    }


}

export default Base;
