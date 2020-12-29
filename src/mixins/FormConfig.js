import { assignOnObject } from "../utilities/utils";

export default {
    methods: {
        getFormFieldComponent(fieldWidget) {
            switch (fieldWidget) {
                case "column":
                    return "form-column";
                case "tab":
                    return "form-tab";
                case "static":
                    return "form-static";
                case "text":
                    return "form-text";
                case "autocomplete":
                    return "form-autocomplete";
                case "textarea":
                    return "form-textarea";
                case "dropdown":
                    return "form-select";
                case "multidropdown":
                    return "form-multi-select";
                case "checkbox":
                    return "form-checkbox";
                case "radio":
                    return "form-radio";
                case "datepicker":
                    return "form-datepicker";
                case "timepicker":
                    return "form-timepicker";
                case "datetimepicker":
                    return "form-datetimepicker";
                case "files":
                    return "form-files";
                case "wysiwyg":
                    return "form-wysiwyg";
                case "code":
                    return "form-code";
                default:
                    return fieldWidget;
            }
        },
        getRequiredBool(field) {
            if (field.field_extra.required) {
                return true;
            }

            return false;
        },
        getFieldValue(data, field) {
            if (!field.value_field) {
                return null;
            }

            let value = Object.getFormValueByString(data, field.value_field);
            return value;
        },
        updateFormValue(field, newVal) {
            assignOnObject(this.form.data, field.value_field, newVal);
        },
        defaultFields(data) {
            this.formConfig.fields.forEach(field => {
                if (
                    typeof this.getFieldValue(data, field) === "undefined" ||
                    this.getFieldValue(data, field) === ""
                ) {
                    assignOnObject(data, field.value_field, null);
                    if (
                        field.field_extra !== null &&
                        typeof field.field_extra.default !== "undefined"
                    ) {
                        assignOnObject(
                            data,
                            field.value_field,
                            field.field_extra.default
                        );
                    }
                }
            });

            return data;
        }
    }
};
