import { Form } from "./../classes/Form";
import { IFormFieldFieldConfig } from "./../types";
import { FormField } from "./../classes/models/formField";

export const setupHasOptions = (
    props: Record<string, any>,
    form: Form,
    fieldConfig: IFormFieldFieldConfig
) => {
    if (
        props.findInForm &&
        (Array.isArray(form.formConfig.fields) ||
            typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
        const field = form.formConfig.fields.find(
            (field: FormField) => field.name === props.fieldName
        );

        if (field) {
            if (
                !field.field_extra.options_config ||
                (field.field_extra.options_config.vuex_store_path &&
                    field.field_extra.options_config.vuex_getter_path)
            ) {
                throw new Error(
                    "Invalid field configuration for field: " + field.name
                );
            }

            fieldConfig.options.options = [];
            fieldConfig.options.optionsUrlParams = {};

            if (field.field_extra.options_config.vuex_store_path) {
                fieldConfig.options.vuexStorePath =
                    field.field_extra.options_config.vuex_store_path;
            }

            if (field.field_extra.options_config.vuex_getter_path) {
                fieldConfig.options.vuexGetterPath =
                    field.field_extra.options_config.vuex_getter_path;
            }

            if (field.field_extra.options_config.optionsURL) {
                // TODO
                // this.setUpOptionsURL(field);
            }

            if (field.field_extra.options_config.optionsUrlParams) {
                fieldConfig.options.optionsUrlParams =
                    field.field_extra.options_config.optionsUrlParams;
            }

            if (field.field_extra.options_config.options) {
                // TODO
                // this.setUpOptions(field);
            }

            fieldConfig.options.optionValueField = "id";
            fieldConfig.options.optionLableField = "name";

            if (field.field_extra.options_config.optionValueField) {
                fieldConfig.options.optionValueField =
                    field.field_extra.options_config.optionValueField;
            }

            if (field.field_extra.options_config.optionLabelField) {
                fieldConfig.options.optionLableField =
                    field.field_extra.options_config.optionLabelField;
            }

            if (field.field_extra.options_config.default) {
                fieldConfig.default = field.field_extra.options_config.default;
            }
        }
    } else {
        fieldConfig.options.options = props.options;
        fieldConfig.options.optionValueField = props.optionValueField;
        fieldConfig.options.optionLableField = props.optionLabelField;
        fieldConfig.options.optionsURL = props.optionsUrl;
        fieldConfig.options.optionsUrlParams = props.optionsUrlParams;
        fieldConfig.options.vuexStorePath = props.vuexPath;
        fieldConfig.options.vuexGetterPath = props.vuexPath;
    }
};
