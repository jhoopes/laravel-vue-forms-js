<template>
    <div>
        <component v-for="field in children" :key="field.id"
                   :is="getFormFieldComponent(field.widget)"
                   v-if="field.visible"
                   v-show="conditionValues[field.name]"
                   :field-name="field.name"
                   :value="getFieldValue(form.data, field)"
                   @input="(newVal) => updateValueAndConditionals(newVal, field)"
                   @options-updated="(newOptions) => updateOptionsForField(newOptions, field)"
                   :children="field.children || null"
        ></component>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField'
    import FormConfig from './../mixins/FormConfig'
    import UpdatesValuesAndConditions from './../mixins/UpdatesValuesAndConditions';
    export default {

        mixins: [FormField, FormConfig, UpdatesValuesAndConditions],
        name: 'form-column',

        props: {
            children: {
                type: Array,
                default() {
                    return [];
                }
            }
        },

        created() {
            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if(field.name === this.fieldName) {



                    }
                });

            }else {

            }

            this.generateConditionValues();
        }


    }
</script>
