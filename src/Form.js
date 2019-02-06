import {FormErrors} from "./FormErrors"

export class Form {


    constructor(data, config, disabled) {

        this.initialData = data;
        this.fields = [];
        this.disabled = false;
        this.formFieldOptions = {};
        this.data = {};

        for (let field in data) {
            if (data.hasOwnProperty(field)) {
                this.data[field] = data[field];
                this.fields.push(field);
            }
        }

        if(data.id) {
            this.id = data.id;
        } else {
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
    getData() {

        let data = {};

        this.fields.forEach(field => {
            data[field] = this.data[field];
        })
        return data;

    }

    /** Set the updated data for the form **/
    updateData(newFormData, force) {

        if(typeof force !== "boolean") {
            force = false;
        }

        for (let field in newFormData) {
            if (newFormData.hasOwnProperty(field)) {
                if(!force) {
                    if(this.initialData[field] === this.data[field]) {
                        this.data[field] = newFormData[field];
                        this.initialData[field] = newFormData[field];
                    }
                } else {
                    this.data[field] = newFormData[field];
                    this.initialData[field] = newFormData[field];
                }
            }
        }
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
