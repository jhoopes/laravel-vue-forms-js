import { assignOnObject } from "../utilities/utils";

export default {

    methods: {
        getFormFieldComponent(fieldWidget) {

            switch(fieldWidget) {
                case 'column':
                    return 'form-column';
                    break;
                case 'text':
                    return 'form-text';
                    break;
                case 'autocomplete':
                    return 'form-autocomplete';
                    break;
                case 'textarea':
                    return 'form-textarea';
                    break;
                case 'dropdown':
                    return 'form-select';
                    break;
                case 'checkbox':
                    return 'form-checkbox';
                    break;
                case 'radio':
                    return 'form-radio';
                    break;
                case 'datepicker':
                    return 'form-datepicker';
                    break;
                case 'datetimepicker':
                    return 'form-datetimepicker';
                    break;
                case 'files':
                    return 'form-files';
                    break;
                default:
                    return fieldWidget;
                    break;
            }

        },
        getRequiredBool(field) {

            if(field.field_extra.required) {
                return true;
            }

            return false;
        },
        getFieldValue(form, field) {

            if(!field.value_field) {
                return null;
            }

            let value =  Object.getFormValueByString(form, field.value_field);
            return value;
        },
        updateFormValue(field, newVal) {
            assignOnObject(this.form, field.value_field, newVal);
        },
        defaultFields(data) {

            this.formConfig.fields.forEach(field => {
                if(typeof this.getFieldValue(data, field) === 'undefined' || this.getFieldValue(data, field) === '') {
                    assignOnObject(data, field.value_field, null);
                    if(field.field_extra !== null && typeof field.field_extra.default !== 'undefined') {

                        assignOnObject(data, field.value_field, field.field_extra.default);
                    }
                }
            });

            return data;
        }
    }
}
