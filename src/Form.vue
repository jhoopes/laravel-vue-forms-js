<template>
    <div class="vue-form">
        <div class="text-right" v-if="showCloseIcon">
            <span class="close-icon fa fa-times" @click="close"></span>
        </div>
        <form @submit.prevent="">
            <div v-if="layoutType === 'tabs'" class="form-tabs">
                <form-tabs>
                    <component v-for="field in fields" :key="field.id"
                       :name="field.field_extra ? field.field_extra.name : field.name "
                       :is="getFormFieldComponent(field.widget)"
                       :field-name="field.name"
                       :disabled="disabled"
                       :auto-save="autoSave"
                       :actions="actions"
                       @runAction="runAction"
                       v-show="field.visible && conditionValues[field.name]"
                       :children="field.children || null"
                       :class="columnWidth + ' ' + 'm-2'"
                    ></component>
                </form-tabs>
            </div>
            <div :class="{ 'flex' : (columnCount > 1) }" v-else>
                <component v-for="field in fields" :key="field.id"
                           :is="getFormFieldComponent(field.widget)"
                           v-show="field.visible && conditionValues[field.name]"
                           :field-name="field.name"
                           :value="getFieldValue(form.data, field)"
                           @input="(newVal) => updateValueAndConditionals(newVal, field)"
                           @options-updated="(newOptions) => updateOptionsForField(newOptions, field)"
                           :children="field.children || null"
                           :class="columnWidth + ' ' + 'm-2'"
                ></component>
            </div>
            <div class="controls-row" v-if="disabled === false && autoSave === false && layoutType !== 'tabs'">
                <button class="button" v-for="action in actions" @click.prevent="runAction(action.action)">{{ action.label }}</button>
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
                formDataWatcher: null,
            }
        },

        created() {

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
            layoutType() {

                let tabField = this.fields.find(field => {
                    if(field.widget === 'tab') {
                        return true;
                    }
                    return false;
                });

                if(tabField) {
                    return 'tabs';
                }


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

                this.formDataWatcher = this.$watch('form.data', debounce(function(newForm) {
                    this.submitForm();
                }, this.autoSaveTimeout), {deep: true})

            }
        },

        watch: {
            formData: {
                handler: function(newFormData, oldFormData) {

                    newFormData = JSON.parse(JSON.stringify(newFormData));

                    if(this.formDataWatcher) {
                        this.formDataWatcher();
                    }

                    this.form.updateData(newFormData);

                    if(this.autoSave) {
                        this.setUpAutoSave();
                    }
                },
                deep: true
            },
            disabled(disabled) {
                this.form.disabled = disabled;
            },
            'form.data': {
                handler: function(updated) {
                    this.$emit('changed', updated);
                },
                deep: true,
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
