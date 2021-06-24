import { IFormFieldFieldConfig } from "./../types";
import { inject, reactive, computed, SetupContext } from "vue";
import { Form } from "./../classes/Form";
import defaultApiClient from "./../classes/apiClient";
import { FormConfiguration } from "./../classes/models/formConfiguration";
import { FormField } from "./../classes/models/formField";

/**
 * because props for a variety of form fields could by anything,
 * cast props to any, but still return expected items
 */
export const setupFormField = (props: any, context: SetupContext) => {
    const form = inject("form", new Form({}, new FormConfiguration({}), true));
    const apiClient = inject("apiClient", defaultApiClient);
    const formHasJsonApi = inject("formHasJsonApi", false);

    const fieldConfig = reactive({
        options: {},
    }) as IFormFieldFieldConfig;

    if (
        props.findInForm &&
        (Array.isArray(form.formConfig.fields) ||
            typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
        form.formConfig.fields.forEach((field) => {
            if (field.name === props.fieldName) {
                fieldConfig.fieldName = props.fieldName;

                const fieldExtra = getFormFieldFieldExtra(field);
                if (typeof fieldExtra.required === "undefined") {
                    fieldExtra.required = false;
                }

                if (
                    typeof fieldExtra.default !== "undefined" &&
                    (props.modelValue === null ||
                        typeof props.modelValue === "undefined")
                ) {
                    context.emit("update:modelValue", fieldExtra.default);
                    fieldConfig.default = fieldExtra.default;
                }

                fieldConfig.fieldExtra = fieldExtra;
                fieldConfig.label = field.label;
                fieldConfig.valueField = field.value_field;
                fieldConfig.disabled = field.disabled;
            }
        });
    } else {
        fieldConfig.fieldName = props.fieldName;
        fieldConfig.fieldExtra = {
            required: props.required,
        };
        fieldConfig.label = props.label;
        fieldConfig.valueField = props.fieldName;
        fieldConfig.disabled = props.disabled;
    }

    return {
        form,
        apiClient,
        formHasJsonApi,
        fieldConfig,
    };
};

export const getFormFieldFieldExtra = (
    field: FormField
): Record<string, any> => {
    let fieldExtra = field.field_extra;
    if (!fieldExtra) {
        fieldExtra = {};
    }
    return fieldExtra;
};

export const helpTextComputedProperties = (
    fieldConfig: IFormFieldFieldConfig
) => {
    const withHelpIcon = computed(() => {
        return !!fieldConfig.fieldExtra.withIcon;
    });

    const hasHelpText = computed(() => {
        return !!(
            fieldConfig.fieldExtra.helpText && !fieldConfig.fieldExtra.withIcon
        );
    });

    return {
        withHelpIcon,
        hasHelpText,
    };
};

export const errorComputedProperties = (
    form: Form,
    fieldConfig: IFormFieldFieldConfig
) => {
    const hasError = computed(() => {
        return form.errors.has(fieldConfig.valueField);
    });

    const errorMessages = computed(() => {
        return form.errors.get(fieldConfig.valueField, false);
    });

    return {
        hasError,
        errorMessages,
    };
};
