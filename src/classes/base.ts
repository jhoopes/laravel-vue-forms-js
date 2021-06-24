import { reactive } from "vue";
import defaultsDeep from "lodash/defaultsDeep";
import defaultTo from "lodash/defaultTo";
import get from "lodash/get";
import set from "lodash/set";
import uniqueId from "lodash/uniqueId";

/**
 * Base class for other classes requiring UID, options, etc.
 */
export class Base {
    private _options: Record<string, any>;
    private readonly _uid: string;

    constructor(options?: Record<string, any>) {
        this._uid = uniqueId();
        this._options = {};

        options = defaultTo(options, {});
        this.setOptions(options);
        this.boot();
    }

    get $class(): string {
        return Object.getPrototypeOf(this).constructor.name;
    }

    /**
     * Called after construction, this hook allows you to add some extra setup
     * logic without having to override the constructor.
     */
    // eslint-disable-next-line
    boot(): void {}

    /**
     * @returns {string} Default string representation.
     */
    toString(): string {
        return `<${this.$class} #${this._uid}>`;
    }

    /**
     * @returns {string} UID for the class
     */
    getUid(): string {
        return this._uid;
    }

    /**
     * @returns {Object} This class' default options.
     */
    getDefaultOptions(): Record<string, any> {
        return {};
    }

    /**
     * @param {Array|string} path     Option path resolved by `get`
     * @param {*}            fallback Fallback value if the option is not set.
     *
     * @returns {*} The value of the given option path.
     */
    // eslint-disable-next-line
    getOption(path: string, fallback?: any) {
        return get(this._options, path, fallback);
    }

    /**
     * @returns {Object} This instance's default options.
     */
    instanceOptions(): Record<string, any> {
        return {};
    }

    /**
     * Sets an option.
     *
     * @param {string} path
     * @param {*}      value
     */
    // eslint-disable-next-line
    setOption(path: string, value: any) {
        set(this._options, path, value);
    }

    /**
     * Sets all given options. Successive values for the same option won't be
     * overwritten, so this follows the 'defaults' behaviour, and not 'merge'.
     *
     * @param {...Object} options One or more objects of options.
     */
    setOptions(...options: Record<string, any>[]): void {
        this._options = reactive(
            defaultsDeep(
                {},
                ...options,
                this.getDefaultOptions(),
                this.instanceOptions()
            )
        );
    }

    /**
     * Returns all the options that are currently set on this instance.
     *
     * @return {Object}
     */
    getOptions(): Record<string, any> {
        return defaultTo(this._options, {});
    }
}

export default Base;
