import {FormErrors} from "./FormErrors"

export class Form {


    constructor(data, config, disabled) {

        this.initialData = data;
        this.fields = [];
        this.disabled = false;

        for (let field in data) {
            if (data.hasOwnProperty(field)) {
                this[field] = data[field];
                this.fields.push(field);
            }
        }

        if(!this.id) {
            this.id = null;
        }

        if(config) {
            this.formConfig = config;
        }

        if(disabled) {
            this.disabled = true;
        }

        this.errors = new FormErrors();
    }

    /** Get the data for the form based on initial data fields **/
    data() {

        let data = {};

        this.fields.forEach(field => {
            data[field] = this[field];
        })
        return data;

    }


    /** Reset the form to the initial data **/
    reset() {

        this.fields.forEach(field => {
            this[field] = this.initialData[field];
        });
    }

    clearFields() {
        this.fields.forEach(field => {
            this[field] = '';
        });
    }

}