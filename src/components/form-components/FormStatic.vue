<template>
    <div>
        <component
            :is="fieldConfig.options.staticTag"
            v-html="fieldConfig.options.staticText"
        ></component>
    </div>
</template>
<script lang="ts">
import {defineComponent, SetupContext} from 'vue';
import { FormField } from '../../classes/models/formField';
import {getFormFieldFieldExtra, setupFormField} from "./../../composition/formField";

export default defineComponent({
    name: "form-static",

    setup(props, context: SetupContext) {
        let {fieldConfig, form} = setupFormField(props, context);

        if (
            props.findInForm &&
            (Array.isArray(form.formConfig.fields) ||
                typeof form.formConfig.fields[Symbol.iterator] === "function")
        ) {
            form.formConfig.fields.forEach( (field: FormField) => {
                if (field.name === props.fieldName) {

                    let fieldExtra = getFormFieldFieldExtra(field);
                    fieldConfig.options.staticText = fieldExtra.staticText;
                    fieldConfig.options.staticTag = fieldExtra.staticTag
                }
            });
        } else {
            fieldConfig.options.staticText = props.staticText;
            fieldConfig.options.staticTag = props.staticTag
        }

        return {
            fieldConfig,
        }
    },



    props: {
        staticText: {
            type: String
        },
        staticTag: {
            type: String,
            default: "p"
        },


        label: {
            type: String
        },
        fieldName: {
            type: String,
            required: true
        },
        value: {
            required: true
        },
        showLabel: {
            type: Boolean,
            default: true
        },
        required: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        findInForm: {
            type: Boolean,
            default: false
        },
        useJsonApi: {
            type: Boolean,
            default: false
        }
    },
});
</script>
