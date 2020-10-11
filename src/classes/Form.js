import { FormErrors } from "@/classes/FormErrors";
import { assignOnObject, byString } from "@/utilities/utils";

export class Form {
    constructor(data, config, disabled) {
        this.initialData = data;
        this.fields = [];
        this.disabled = false;
        this.formFieldOptions = {};
        this.data = {};

        for (let field in data) {
            if (Object.prototype.hasOwnProperty.call(data, field)) {
                this.data[field] = data[field];
                this.fields.push(field);
            }
        }

        if (data.id) {
            this.id = data.id;
        } else {
            this.id = null;
        }

        if (config) {
            this.formConfig = config;
        }

        if (disabled) {
            this.disabled = true;
        }

        this.errors = new FormErrors();
    }

    /** Get the data for the form based on initial data fields **/
    getData() {
        let data = {};

        this.fields.forEach(field => {
            data[field] = this.data[field];
        });
        return data;
    }

    /** Set the updated data for the form **/
    updateData(newFormData, force) {
        if (typeof force !== "boolean") {
            force = false;
        }

        this.formConfig.fields.forEach(formField => {
            if (!formField.value_field) {
                return;
            }

            let newFormDataValue = byString(newFormData, formField.value_field);
            if (!newFormDataValue) {
                return;
            }

            if (!force) {
                let initialDataValue = byString(
                    this.initialData,
                    formField.value_field
                );
                let currentDataValue = byString(
                    this.data,
                    formField.value_field
                );

                if (initialDataValue == currentDataValue) {
                    assignOnObject(
                        this.data,
                        formField.value_field,
                        newFormDataValue
                    );
                    assignOnObject(
                        this.initialData,
                        formField.value_field,
                        newFormDataValue
                    );
                }
            } else if (force) {
                assignOnObject(
                    this.data,
                    formField.value_field,
                    newFormDataValue
                );
                assignOnObject(
                    this.initialData,
                    formField.value_field,
                    newFormDataValue
                );
            }
        });

        if (this.id === null && newFormData.id) {
            this.id = newFormData.id;
            this.data.id = newFormData.id;
        }
    }

    /** Reset the form to the initial data **/
    reset() {
        this.formConfig.fields.forEach(field => {
            this[field] = this.initialData[field];
        });
    }

    clearFields() {
        this.formConfig.fields.forEach(field => {
            this.data[field.value_field] = null;
        });
    }
}
