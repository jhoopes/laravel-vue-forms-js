export default {

    methods: {
        getFormFieldComponent(fieldWidget) {

            switch(fieldWidget) {
                case 'text':
                    return 'form-text';
                    break;
                case 'textarea':
                    return 'form-textarea';
                    break;
                case 'dropdown':
                    return 'form-select';
                    break;
                case 'radio':
                    return 'form-radio';
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
        defaultFields(data) {

            this.formConfig.fields.forEach(field => {
                if(typeof data[field.value_field] === 'undefined') {
                    data[field.value_field] = null;

                    if(field.field_extra !== null && typeof field.field_extra.default !== 'undefined') {
                        data[field.value_field] = field.field_extra.default;
                    }
                }
            });

            return data;
        }
    }
}
