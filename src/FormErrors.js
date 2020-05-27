import Vue from 'vue';

export class FormErrors {
    /**
     * Create a new Errors instance.
     */
    constructor() {
        this.fieldErrors = {};
        this.message = null;
    }


    /**
     * Determine if an errors exists for the given field.
     *
     * @param {string} field
     */
    has(field) {
        return this.fieldErrors.hasOwnProperty(field);
    }


    /**
     * Determine if we have any errors.
     */
    any() {
        return Object.keys(this.fieldErrors).length > 0;
    }


    /**
     * Retrieve the error message for a field.
     *
     * @param {string} field
     */
    get(field, first) {
        if (this.fieldErrors[field]) {
            if(first) {
                return this.fieldErrors[field][0];
            }
            return this.fieldErrors[field];
        }
    }

    hasGeneralMessage() {
        return this.message !== null;
    }


    getGeneralMessageType() {
        return this.message.type;
    }

    getGeneralMessage() {
        return this.message.message;
    }


    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    setErrors(errors) {

        // check for Laravel 5.5 validation errors message
        if(errors.hasOwnProperty('errors')) {
            this.fieldErrors = errors.errors;
        } else {
            this.fieldErrors = errors;
        }
    }



    report(error) {

        if(error.response && parseInt(error.response.status) === 422) {

            // determine if we have json api response or not
            if(
                Array.isArray(error.response.data.errors) &&
                error.response.data.errors[0].id &&
                error.response.data.errors[0].title &&
                error.response.data.errors[0].detail &&
                typeof error.response.data.errors[0].source === 'object'
            ) {
                error.response.data.errors.forEach((error) => {
                    Vue.set(this.fieldErrors, error.source.field, error.source.messages);
                });
            } else {
                this.setErrors(error.response.data);
            }

            return;
        } else if(error.response && parseInt(error.response.status) === 403) {
            // authorization error
            this.message = {
                message: 'This action is unauthorized',
                type: 'error'
            };
            return;
        }


        // handle general error


    }



    /**
     * Clear one or all error fields.
     *
     * @param {string|null} field
     */
    clear(field) {
        if (field) {
            delete this.fieldErrors[field];
            this.message = null;
            return;
        }

        this.fieldErrors = {};
        this.message = null;
    }
}
