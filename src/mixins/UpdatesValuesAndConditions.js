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

            if(fieldExtra.condition && fieldExtra.condition.fieldName && fieldExtra.condition.fieldValue) {


                let conditionField = this.form.formConfig.fields.filter(f => {return f.name === fieldExtra.condition.fieldName})[0];
                var conditionFieldFieldExtra = null;
                if(conditionField) {
                    conditionFieldFieldExtra = this.getFormFieldFieldExtra(conditionField);
                }

                if (this.form.formFieldOptions[fieldExtra.condition.fieldName]) {

                    let conditionOption = this.form.formFieldOptions[fieldExtra.condition.fieldName].filter(option => {
                        return option[conditionFieldFieldExtra.options_config.optionLabelField] === fieldExtra.condition.fieldValue
                    })[0];

                    if( conditionOption && this.form[conditionField.value_field] === conditionOption[conditionFieldFieldExtra.options_config.optionValueField]) {
                        this.$set(this.conditionValues, field.name, true);
                    }else {
                        this.$set(this.conditionValues, field.name, false);
                    }
                } else if(this.form[fieldExtra.condition.fieldName] === fieldExtra.condition.fieldValue) {
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
        updateOptionsForField(newOptions, field) {
            this.$set(this.form.formFieldOptions, field.name, newOptions);
            this.generateConditionValues();
        },
    }
}
