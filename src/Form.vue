<template>
    <div class="vue-form">
        <div class="text-right" v-if="showCloseIcon">
            <span class="close-icon fa fa-times" @click="close"></span>
        </div>
        <form @submit.prevent="">
            <component v-for="field in formConfig.fields" :key="field.id"
                       :is="getFormFieldComponent(field.widget)"
                       v-if="field.visible"
                       v-show="conditionValues[field.name]"
                       :field-name="field.name"
                       :value="getFieldValue(form, field)"
                       @input="(newVal) => updateValueAndConditionals(newVal, field)"
                       @options-updated="(newOptions) => updateOptionsForField(newOptions, field)"
            ></component>
            <div class="controls-row" v-if="disabled === false">
                <button class="inputbutton1" @click.prevent="submitForm">Save</button>
                <button class="inputbutton1" @click.prevent="cancel">Cancel</button>
                <button class="inputbutton1" @click.prevent="resetForm">Reset</button>
            </div>
        </form>
    </div>
</template>
<script>
    import FormProps from './mixins/FormProps';
    import FormConfig from './mixins/FormConfig';
    import Actions from './mixins/Actions'
    import UpdatesValuesAndConditions from './mixins/UpdatesValuesAndConditions';
    import {Form} from "./Form";


    import FormText from './FormComponents/FormText.vue';
    import FormTextarea from './FormComponents/FormTextarea.vue';
    import FormSelect from './FormComponents/FormSelect.vue';
    import FormDateTimePicker from './FormComponents/FormDateTimePicker.vue';
    import FormDatePicker from './FormComponents/FormDatePicker.vue';
    import FormRadio from './FormComponents/FormRadio.vue';
    import FormCheckbox from './FormComponents/FormCheckbox.vue';
    import FormAutocomplete from './FormComponents/FormAutocomplete.vue';
    import FormFiles from './FormComponents/Files/FormFiles.vue';
    export default {

        name: 'vue-form',

        mixins: [
            FormProps,
            FormConfig,
            Actions,
            UpdatesValuesAndConditions
        ],

        components: {
            FormText,
            FormAutocomplete,
            FormTextarea,
            FormSelect,
            FormDatePicker,
            FormRadio,
            FormCheckbox,
            FormFiles,
            'form-datetimepicker': FormDateTimePicker
        },


        data() {
            return {
                form: {},
            }
        },

        created() {

            // TODO: Think about what cloning form data means, and if we should listen for changes for form data

            var formData = Object.assign({}, this.formData);

            var data = this.defaultFields(formData);
            this.form = new Form(data, this.formConfig, this.disabled);

            this.generateConditionValues();
        },

        provide() {

            let provide = {};

            Object.defineProperty(provide, 'form', {
                enumerable: true,
                get: () => this.form
            });
            return provide;
        },


    }
</script>
