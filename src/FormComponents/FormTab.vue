<template>
    <section
             :aria-hidden="! isActive"
             class="tabs-component-panel"
             :id="hash"
             role="tabpanel"
    >
        <div v-show="isActive">
            <component
                v-for="field in children" :key="field.id"
                :is="getFormFieldComponent(field.widget)"
                v-if="field.visible"
                v-show="conditionValues[field.name]"
                :field-name="field.name"
                :value="getFieldValue(form.data, field)"
                @input="(newVal) => updateValueAndConditionals(newVal, field)"
                @options-updated="(newOptions) => updateOptionsForField(newOptions, field)"
                :children="field.children || null"
            ></component>
            <div class="controls-row" v-if="disabled === false && autoSave === false">
                <button class="button" v-for="action in actions" @click.prevent="runAction(action.action)" v-html="action.label":disabled="showSaving && saving"></button>
                <span v-if="saving && showSaving"><font-awesome-icon :icon="spinner" :spin="true"></font-awesome-icon>{{ savingText }}</span>
            </div>
        </div>
    </section>
</template>

<script>
    import FormField from './../mixins/FormField'
    import FormConfig from './../mixins/FormConfig'
    import UpdatesValuesAndConditions from './../mixins/UpdatesValuesAndConditions';

    import {
        faSpinner,
    } from "@fortawesome/free-solid-svg-icons";

    import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

    export default {


        mixins: [FormField, FormConfig, UpdatesValuesAndConditions],

        name: 'form-tab',

        components: {
            FontAwesomeIcon
        },

        props: {
            children: {
                type: Array,
                default() {
                    return [];
                }
            },
            id: {
                default: null
            },
            name: {
                required: true
            },
            value: {
                required: false,
            },
            prefix: {
                default: ''
            },
            suffix: {
                default: ''
            },
            disabled: {
                required: true,
            },
            autoSave: {
                required: true,
            },
            actions: {
                required: true,
            },
            saving: {
                required: true,
            },
            showSaving: {
                required: true,
            },
            savingText: {
                required: true,
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
        },



        data: () => ({
            isActive: false,
            spinner: faSpinner
        }),

        computed: {
            header() {
                return this.prefix + this.name + this.suffix;
            },

            hash() {
                return this.id ?
                    '#' + this.id :
                    '#' + this.name.toLowerCase().replace(/ /g, '-');
            },
        },

        methods: {
            runAction(action) {
                this.$emit('runAction', action);
            }
        }
    };
</script>
