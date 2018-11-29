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

                    if(!conditionFieldFieldExtra.options_config.optionLabelField) {
                        conditionFieldFieldExtra.options_config.optionLabelField = 'name';
                    }

                    if(!conditionFieldFieldExtra.options_config.optionValueField) {
                        conditionFieldFieldExtra.options_config.optionValueField = 'id';
                    }

                    let conditionOption = this.getConditionOptions(fieldExtra.condition.valueField).filter(option => {
                        return option[conditionFieldFieldExtra.options_config.optionLabelField] === fieldExtra.condition.fieldValue
                    })[0];

                    if( conditionOption && this.getFieldValue(this.form.data, conditionField) === conditionOption[conditionFieldFieldExtra.options_config.optionValueField]) {
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
        },
    }
}
