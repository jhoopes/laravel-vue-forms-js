import {FormErrors} from "./FormErrors";
import {assignOnObject, byString} from "./../utilities/utils";
import {FormConfiguration} from "./models/formConfiguration";
import {FormField} from "./models/formField";
import {reactive} from "vue";

export class Form {
    public data: Record<string, any>
    public initialData: Record<string, any>
    public fields: FormField[]
    public disabled: boolean
    public formFieldOptions: Record<string, any>
    public id: number | null
    public formConfig: FormConfiguration
    public errors: FormErrors
    public fieldMeetsConditions: Record<string, boolean>

    constructor(data: Record<string, any>, config: FormConfiguration, disabled?: boolean) {
        this.initialData = reactive(data);
        this.fields = reactive([]);
        /** @ts-ignore **/
        this.disabled = false;
        this.formFieldOptions = reactive({});
        this.data = reactive({});
        this.fieldMeetsConditions = reactive({})

        config.fields.forEach(field => {
            this.fields.push(field);
            if (typeof data[field.value_field] !== "undefined") {
                this.data[field.value_field] = data[field.value_field];
            } else {
                this.data[field.value_field] = null;
            }
        });

        if (data.id) {
            this.id = data.id;
        } else {
            this.id = null;
        }

        if (disabled) {
            this.disabled = true;
        }

        this.formConfig = config;
        /** @ts-ignore **/
        this.errors = new FormErrors();
    }

    /** Get the data for the form based on initial data fields **/
    getData(): Record<string, any> {
        let data = {} as Record<string, any>;

        if (this.initialData.id) {
            data.id = this.initialData.id;
        }

        this.fields.forEach(field => {
            data[field.value_field] = this.data[field.value_field];
        });
        return data;
    }

    /** Set the updated data for the form **/
    updateData(newFormData: Record<string, any>, force?: boolean) {
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
                let currentDataValue = byString(this.data, formField.value_field);

                if (initialDataValue == currentDataValue) {
                    assignOnObject(this.data, formField.value_field, newFormDataValue);
                    assignOnObject(
                        this.initialData,
                        formField.value_field,
                        newFormDataValue
                    );
                }
            } else if (force) {
                assignOnObject(this.data, formField.value_field, newFormDataValue);
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
            this.data[field.value_field] = this.initialData[field.value_field];
        });
    }

    clearFields() {
        this.formConfig.fields.forEach(field => {
            this.data[field.value_field] = null;
        });
    }


    // pulling more functionality into form class, maybe separate some out to different sub-like classes like errors
    // but for now, keeping it here.

    getFieldValue(field: FormField | string) {

        if(field instanceof FormField) {
            return this.data[field.value_field];
        }

        return this.data[field];
    }


    updateFormValue(field: FormField | string, newValue: any) {

        if(field instanceof FormField) {
            this.data[field.value_field] = newValue;
            return
        }

        this.data[field] = newValue;
    }

    updateValueAndConditionals(newVal: any, field: FormField | string) {
        this.updateFormValue(field, newVal);
        this.generateConditionValues();
    }

    updateOptionsForField(newOptions: Record<string, any>[], field: FormField) {
        assignOnObject(
            this.formFieldOptions,
            field.value_field,
            newOptions
        );
        this.generateConditionValues();
    }


    generateConditionValues() {
        this.formConfig.fields.forEach(field => {
            this.meetsConditions(field);
        });
    }

    meetsConditions(field: FormField) {
        let fieldExtra = this.getFormFieldFieldExtra(field);

        if (
            fieldExtra.condition &&
            fieldExtra.condition.valueField &&
            fieldExtra.condition.fieldValue
        ) {
            let conditionFieldCollection = this.formConfig.fields.filter((f: FormField) => {
                return f.value_field === fieldExtra.condition.valueField;
            });

            let conditionField = conditionFieldCollection.first();
            var conditionFieldFieldExtra: Record<string, any> = {};
            if (conditionField !== null) {
                conditionFieldFieldExtra = this.getFormFieldFieldExtra(
                    conditionField
                );
            } else {
                // if the valueField from the condition was not found set the view to be false
                this.fieldMeetsConditions[field.name] = false;
                console.log(
                    "Invalid condition field. [ " +
                    field.name +
                    " ] Is your configuration correct?"
                );
                return;
            }

            if (this.getConditionOptions(fieldExtra.condition.valueField)) {
                // Default option label field to name, as this is the default from FormSelect
                if (
                    !conditionFieldFieldExtra.options_config
                        .optionLabelField
                ) {
                    conditionFieldFieldExtra.options_config.optionLabelField =
                        "name";
                }

                // Default the option value field to id, as this is the default from FormSelect
                if (
                    !conditionFieldFieldExtra.options_config
                        .optionValueField
                ) {
                    conditionFieldFieldExtra.options_config.optionValueField =
                        "id";
                }

                let validConditionOptions = this.getConditionOptions(
                    fieldExtra.condition.valueField
                ).filter((option: Record<string, any>) => {
                    return fieldExtra.condition.fieldValue.includes(
                        option[
                            conditionFieldFieldExtra.options_config
                                .optionLabelField
                            ]
                    );
                });

                // ensure that strings are converted to actual numbers for ID key values
                // var value = this.getFieldValue(
                //     this.form.data,
                //     conditionField
                // );
                var value = byString(this.data, conditionField.value_field);
                if (!isNaN(value)) {
                    value = Number(value);
                }

                let conditionValueOption = validConditionOptions.find(
                    conditionOption => {
                        return (
                            conditionOption[
                                conditionFieldFieldExtra.options_config
                                    .optionValueField
                                ] === value
                        );
                    }
                );

                if (validConditionOptions && conditionValueOption) {
                    this.fieldMeetsConditions[field.name] = true;
                } else {
                    this.fieldMeetsConditions[field.name] = false;
                }
            } else if (
                byString(this.data, conditionField.value_field) ===
                fieldExtra.condition.fieldValue
            ) {
                this.fieldMeetsConditions[field.name] = true;
            } else {
                this.fieldMeetsConditions[field.name] = false;
            }
        } else {
            this.fieldMeetsConditions[field.name] = true;
        }
    }

    getFormFieldFieldExtra(field: FormField) {
        var fieldExtra = field.field_extra;
        if (!fieldExtra) {
            fieldExtra = {};
        }
        return fieldExtra;
    }

    getConditionOptions (valueField:string): Record<string, any>[] {
        return byString(this.formFieldOptions, valueField);
    }


}
