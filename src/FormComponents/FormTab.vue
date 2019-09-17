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
                <button class="button" v-for="action in actions" @click.prevent="runAction(action.action)">{{ action.label }}</button>
            </div>
        </div>
    </section>
</template>

<script>
    import FormField from './../mixins/FormField'
    import FormConfig from './../mixins/FormConfig'
    import UpdatesValuesAndConditions from './../mixins/UpdatesValuesAndConditions';
    export default {


        mixins: [FormField, FormConfig, UpdatesValuesAndConditions],

        name: 'form-tab',

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
