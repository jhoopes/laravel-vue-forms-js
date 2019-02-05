<template>
    <div class="vue-form">
        <div class="text-right" v-if="showCloseIcon">
            <span class="close-icon fa fa-times" @click="close"></span>
        </div>
        <form @submit.prevent="">
            <div :class="{ 'flex' : (columnCount > 1) }">
                <component v-for="field in fields" :key="field.id"
                           :is="getFormFieldComponent(field.widget)"
                           v-if="field.visible"
                           v-show="conditionValues[field.name]"
                           :field-name="field.name"
                           :value="getFieldValue(form.data, field)"
                           @input="(newVal) => updateValueAndConditionals(newVal, field)"
                           @options-updated="(newOptions) => updateOptionsForField(newOptions, field)"
                           :children="field.children || null"
                           :class="columnWidth + ' ' + 'm-2'"
                ></component>
            </div>
            <div class="controls-row" v-if="disabled === false && autoSave === false">
                <button class="button" @click.prevent="submitForm">Save</button>
                <button class="button" @click.prevent="cancel">Cancel</button>
                <button class="button" @click.prevent="resetForm">Reset</button>
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


    import FormColumn from './FormComponents/FormColumn';
    import FormText from './FormComponents/FormText.vue';
    import FormTextarea from './FormComponents/FormTextarea.vue';
    import FormSelect from './FormComponents/FormSelect.vue';
    import FormDatePicker from './FormComponents/FormDatePicker.vue';
    import FormRadio from './FormComponents/FormRadio.vue';
    import FormCheckbox from './FormComponents/FormCheckbox.vue';
    import FormAutocomplete from './FormComponents/FormAutocomplete.vue';
    import FormFiles from './FormComponents/Files/FormFiles.vue';

    import { cloneObject} from "./utilities/utils";
    import { debounce } from 'lodash';

    export default {

        name: 'vue-form',

        mixins: [
            FormProps,
            FormConfig,
            Actions,
            UpdatesValuesAndConditions
        ],

        components: {
            FormColumn,
            FormText,
            FormAutocomplete,
            FormTextarea,
            FormSelect,
            FormDatePicker,
            FormRadio,
            FormCheckbox,
            FormFiles,
        },


        data() {
            return {
                form: {},
            }
        },

        created() {

            // TODO: Think about what cloning form data means, and if we should listen for changes for form data
            // TODO: Eventually find a way for cloned objects to also clone arrays
            //var formData = cloneObject(this.formData);
            var formData = JSON.parse(JSON.stringify(this.formData));
            var data = this.defaultFields(formData);

            this.form = new Form(data, this.formConfig, this.disabled);
            this.generateConditionValues();


            if(this.autoSave) {
                this.setUpAutoSave();
            }
        },

        computed: {

            fields() {

                let topLevelFields = this.formConfig.fields.filter(field => {
                    if(field.parent_id) {
                        return false;
                    }
                    return true;
                });

                topLevelFields.forEach(topLevelField => {
                    topLevelField.children = this.formConfig.fields.filter(field => {
                        return field.parent_id === topLevelField.id;
                    })
                });

                return topLevelFields;
            },
            columnCount() {
                var columnCount = 0;
                this.fields.forEach(field => {
                    if(field.widget === 'column') {
                        columnCount++;
                    }
                });

                if(columnCount === 0) {
                    columnCount = 1;
                }

                return columnCount;
            },
            columnWidth() {
                if(this.columnCount === 0) {
                    return null;
                }

                return 'w-1/' + this.columnCount;
            }
        },

        provide() {

            let provide = {};

            Object.defineProperty(provide, 'form', {
                enumerable: true,
                get: () => this.form
            });

            Object.defineProperty(provide, 'apiClient', {
                enumerable: true,
                get: () => this.apiClient
            });
            return provide;
        },

        methods: {
            setUpAutoSave() {

                this.$watch('form.data', debounce(function(newForm) {
                    this.submitForm();
                }, this.autoSaveTimeout), {deep: true})

            }
        },

        watch: {
            formData: {
                handler: function(newFormData, oldFormData) {
                    if(JSON.stringify(newFormData) !== JSON.stringify(oldFormData)) {
                        this.form.data = this.form.getNewData(newFormData, false);
                    }
                },
                deep: true
            }
        },


    }
</script>
<style scoped>
    .flex {
        display: flex;
    }

    .mx-2 {
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
</style>
