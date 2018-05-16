export class FormErrors {
    /**
     * Create a new Errors instance.
     */
    constructor() {
        this.errors = {};
    }


    /**
     * Determine if an errors exists for the given field.
     *
     * @param {string} field
     */
    has(field) {
        return this.errors.hasOwnProperty(field);
    }


    /**
     * Determine if we have any errors.
     */
    any() {
        return Object.keys(this.errors).length > 0;
    }


    /**
     * Retrieve the error message for a field.
     *
     * @param {string} field
     */
    get(field, first) {
        if (this.errors[field]) {
            if(first) {
                return this.errors[field][0];
            }
            return this.errors[field];
        }
    }


    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    setErrors(errors) {

        // check for Laravel 5.5 validation errors message
        if(errors.hasOwnProperty('errors')) {
            this.errors = errors.errors;
        } else {
            this.errors = errors;
        }
    }


    /**
     * Clear one or all error fields.
     *
     * @param {string|null} field
     */
    clear(field) {
        if (field) {
            delete this.errors[field];

            return;
        }

        this.errors = {};
    }
}
