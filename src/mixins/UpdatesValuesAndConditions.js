import {assignOnObject, byString} from "../utilities/utils";

export default {

    data() {
        return {
            conditionValues: {},
            fieldOptions: {},
        }
    },

    methods: {
        generateConditionValues() {
            this.form.formConfig.fields.forEach(field => {
                this.meetsConditions(field);
            });
        },
        meetsConditions(field) {

            let fieldExtra = this.getFormFieldFieldExtra(field);

            if(fieldExtra.condition && fieldExtra.condition.valueField && fieldExtra.condition.fieldValue) {

                let conditionField = this.form.formConfig.fields.filter(f => {return f.value_field === fieldExtra.condition.valueField})[0];
                var conditionFieldFieldExtra = null;
                if(conditionField) {
                    conditionFieldFieldExtra = this.getFormFieldFieldExtra(conditionField);
                } else {
                    // if the valueField from the condition was not found set the view to be false
                    this.$set(this.conditionValues, field.name, false);
                    console.log('Invalid condition field.  Is your configuration correct?');
                    return;
                }

                if (this.getConditionOptions(fieldExtra.condition.valueField)) {

                    // Default option label field to name, as this is the default from FormSelect
                    if(!conditionFieldFieldExtra.options_config.optionLabelField) {
                        conditionFieldFieldExtra.options_config.optionLabelField = 'name';
                    }

                    // Default the option value field to id, as this is the default from FormSelect
                    if(!conditionFieldFieldExtra.options_config.optionValueField) {
                        conditionFieldFieldExtra.options_config.optionValueField = 'id';
                    }

                    let validConditionOptions = this.getConditionOptions(fieldExtra.condition.valueField).filter(option => {
                        return fieldExtra.condition.fieldValue.includes(option[conditionFieldFieldExtra.options_config.optionLabelField]);
                    });

                    // ensure that strings are converted to actual numbers for ID key values
                    var value = this.getFieldValue(this.form.data, conditionField);
                    if(!isNaN(value)) {
                        value = Number(value);
                    }

                    let conditionValueOption = validConditionOptions.find(conditionOption => {
                        return conditionOption[conditionFieldFieldExtra.options_config.optionValueField] === value;
                    });

                    if( validConditionOptions && conditionValueOption) {
                        this.$set(this.conditionValues, field.name, true);
                    }else {
                        this.$set(this.conditionValues, field.name, false);
                    }
                } else if(this.getFieldValue(this.form.data, conditionField) === fieldExtra.condition.fieldValue) {
                    this.$set(this.conditionValues, field.name, true);
                }else {
                    this.$set(this.conditionValues, field.name, false);
                }

            } else {

                this.$set(this.conditionValues, field.name, true);
            }
        },
        getFormFieldFieldExtra(field) {
            var fieldExtra = field.field_extra;
            if(!fieldExtra) {
                fieldExtra = {};
            }
            return fieldExtra;
        },
        updateValueAndConditionals(newVal, field) {
            this.updateFormValue(field, newVal); this.generateConditionValues();
        },
        getConditionOptions(valueField) {
            return byString(this.form.formFieldOptions, valueField);
        },
        updateOptionsForField(newOptions, field) {
            assignOnObject(this.form.formFieldOptions, field.value_field, newOptions);
            this.generateConditionValues();
        }
    }
}
