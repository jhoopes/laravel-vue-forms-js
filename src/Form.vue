<template>
    <div class="vue-form">
        <div class="text-right" v-if="showCloseIcon">
            <span class="close-icon fa fa-times" @click="close"></span>
        </div>
        <form @submit.prevent="">
            <component v-for="field in formConfig.fields" :key="field.id"
                       :is="getFormFieldComponent(field.widget)"
                       v-if="field.visible"
                       :field-name="field.name"
                       :value="getFieldValue(form, field)"
                       @input="(newVal) => { updateFormValue(field, newVal) }"
            ></component>
            <div class="controls-row" v-if="disabled === false">
                <button class="inputbutton1" @click="submitForm">Save</button>
                <button class="inputbutton1" @click="cancel">Cancel</button>
                <button class="inputbutton1" @click="resetForm">Reset</button>
            </div>
        </form>
    </div>
</template>
<script>
    import FormProps from './mixins/FormProps';
    import FormConfig from './mixins/FormConfig';
    import Actions from './mixins/Actions'
    import {Form} from "./Form";


    import FormText from './FormComponents/FormText.vue';
    import FormTextarea from './FormComponents/FormTextarea.vue';
    import FormSelect from './FormComponents/FormSelect.vue';
    import FormDateTimePicker from './FormComponents/FormDateTimePicker.vue';
    import FormDatePicker from './FormComponents/FormDatePicker.vue';
    import FormRadio from './FormComponents/FormRadio.vue';
    import FormFiles from './FormComponents/Files/FormFiles.vue';
    export default {

        name: 'vue-form',

        mixins: [
            FormProps,
            FormConfig,
            Actions
        ],

        components: {
            FormText,
            FormTextarea,
            FormSelect,
            FormDatePicker,
            FormRadio,
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

        },

        provide() {

            let provide = {};

            Object.defineProperty(provide, 'form', {
                enumerable: true,
                get: () => this.form
            });
            return provide;
        }
    }
</script>
