<template>
    <div
        class="form-group"
        :id="fieldName + '-code-field'"
        :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label"
        ><span v-html="fieldConfig.label"></span>
            <span class="required" v-if="fieldConfig.fieldExtra.required"
            >&nbsp;&nbsp;(*)</span
            >
            <span
                v-if="withHelpIcon"
                :class="fieldConfig.fieldExtra.withIcon"
                :title="fieldConfig.fieldExtra.helpText"
            ></span>
        </label>
        <div class="">
      <pre
          class="m-0"
          :style="'height: ' + height"
          :id="'code-' + randomId"
      ></pre>
            <span class="errors" v-if="form.errors.has(this.fieldConfig.value_field)">
        {{ form.errors.get(this.fieldConfig.value_field, true) }}
      </span>
        </div>
        <div v-if="hasHelpText">
            <span v-html="fieldConfig.fieldExtra.helpText"></span>
        </div>
    </div>
</template>
<script lang="ts">


import {defineComponent, SetupContext, ref, onMounted, reactive, computed} from 'vue';
import {debounce} from "lodash";

const Ace = require('brace');

// TODO: make this available to be configured through plugin options
require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/monokai');


import {guid} from "./../../utilities/utils"
import {helpTextComputedProperties, setupFormField} from "../../composition/formField";
import {FormField} from "../../classes/models/formField";
import {Editor} from "brace";

export default defineComponent({
    name: "form-code",


    setup(props, context: SetupContext) {

        let randomId = ref(guid());

        let { form, fieldConfig } = setupFormField(props, context);
        let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig)

        if (
            props.findInForm &&
            (Array.isArray(form.formConfig.fields) ||
                typeof form.formConfig.fields[Symbol.iterator] === "function")
        ) {
            form.formConfig.fields.forEach((field: FormField) => {
                if (field.name === props.fieldName) {
                    fieldConfig.options.editorEoptions = {};
                    if (field.field_extra.editorOptions) {
                        fieldConfig.options.editorOptions = field.field_extra.editorOptions;
                    }
                }
            });
        } else {
            fieldConfig.options.editorOptions = props.editorOptions;
        }


        let height = computed(() => {
            if (!fieldConfig.options.editorOptions.height) {
                return "400px";
            }
            return fieldConfig.options.editorOptions.height;
        });

        let mode = computed(() => {
            if (!fieldConfig.options.editorOptions.mode) {
                return "javascript";
            }

            return fieldConfig.options.editorOptions.mode;
        });

        let aceOptions = computed(() => {
            let defaultOptions = {
                showLineNumbers: true,
                enableBasicAutocompletion: true,
                enableSnippets: false,
                enableLiveAutocompletion: false,
                enableEmmet: true
            };

            if (!fieldConfig.options.editorOptions.ace_options) {
                return defaultOptions;
            }

            return Object.assign(
                defaultOptions,
                fieldConfig.options.editorOptions.ace_options
            );
        })

        let editor: Editor;

        const updateValue = debounce(function () {
            let value = editor.session.getValue();
            if (mode.value === "json") {
                try {
                    value = JSON.stringify(JSON.parse(editor.session.getValue()));
                } catch {
                    return;
                }
            }

            form.errors.clear(fieldConfig.valueField);
            context.emit("update:modelValue", value);
        }, 1000);

        onMounted(() => {
            editor = reactive(Ace.edit('code-' + randomId.value))
            editor.setTheme('ace/theme/monokai')
            editor.getSession().setMode('ace/mode/' + mode.value)
            editor.getSession().on('change', updateValue)
            editor.setValue(props.modelValue)
            editor.setOptions(aceOptions);
        })


        return {
            randomId,
            fieldConfig,
            form,
            withHelpIcon,
            hasHelpText,
            height
        }
    },

    emits: [
        'update:modelValue'
    ],

    props: {

        label: {
            type: String
        },
        fieldName: {
            type: String,
            required: true
        },
        modelValue: {
            required: true,
            default: ''
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
        },

        editorOptions: {
            type: Object,
            default: {
                height: '400px',
                mode: 'json',
                ace_options: []
            }
        },
    },


    // computed: {
    //     aceOptions() {
    //         let defaultOptions = {
    //             showLineNumbers: true,
    //             enableBasicAutocompletion: true,
    //             enableSnippets: false,
    //             enableLiveAutocompletion: false,
    //             enableEmmet: true
    //         };
    //
    //         if (!this.fieldConfig.editorOptions.ace_options) {
    //             return defaultOptions;
    //         }
    //
    //         return Object.assign(
    //             defaultOptions,
    //             this.fieldConfig.editorOptions.ace_options
    //         );
    //     },
    //     height() {
    //         if (!this.fieldConfig.editorOptions.height) {
    //             return "400px";
    //         }
    //         return this.fieldConfig.editorOptions.height;
    //     },
    //     mode() {
    //         if (!this.fieldConfig.editorOptions.mode) {
    //             return "javascript";
    //         }
    //
    //         return this.fieldConfig.editorOptions.mode;
    //     }
    // },
    //
    // methods: {
    //     updateValue: debounce(function () {
    //         var value = this.editor.session.getValue();
    //         if (this.mode === "json") {
    //             try {
    //                 value = JSON.stringify(JSON.parse(this.editor.session.getValue()));
    //             } catch {
    //                 return;
    //             }
    //         }
    //
    //         this.form.errors.clear(this.fieldConfig.value_field);
    //         this.$emit("input", value);
    //     }, 1000),
    //     setValueOnEditor() {
    //         var beautify = Ace.require("ace/ext/beautify");
    //
    //         if (this.mode === "json" && typeof this.value === "object") {
    //             let jsonString = JSON.stringify(this.value);
    //             this.editor.session.setValue(jsonString);
    //             beautify.beautify(this.editor.session);
    //             this.$emit("input", jsonString);
    //             return;
    //         }
    //
    //         if (typeof this.value !== "string") {
    //             console.log(this.value);
    //             console.error("Invalid value for code form field");
    //         }
    //
    //         this.editor.session.setValue(this.value);
    //
    //         beautify.beautify(this.editor.session);
    //     }
    // }
});
</script>
