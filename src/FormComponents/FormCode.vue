<template>
    <div class="form-group"
         :id="fieldName + '-code-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label"><span v-html="fieldConfig.label"></span>
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div class="">
            <pre class="m-0" :style="'height: ' + height" :id="'code-' + randomId"></pre>
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
        <div v-if="hasHelpText">
            <span v-html="fieldConfig.field_extra.helpText"></span>
        </div>
    </div>
</template>
<script>

    import FormField from "../mixins/FormField";

    import Ace from 'ace-builds';
    import 'ace-builds/webpack-resolver';
    import 'ace-builds/src-min-noconflict/ext-emmet'
    import 'ace-builds/src-min-noconflict/ext-language_tools';
    import 'ace-builds/src-min-noconflict/ext-beautify'
    import {guid} from "../utilities/utils";
    var themeMonokai = require('ace-builds/src-noconflict/theme-monokai');

    export default {
        mixins: [FormField],
        name: 'form-code',

        data() {
            return {
                randomId: guid(),
                editor: null,
            }
        },


        created() {
            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if(field.name === this.fieldName) {
                        this.$set(this.fieldConfig, 'editorOptions',  {});
                        if(field.field_extra.editorOptions) {
                            this.fieldConfig.editorOptions = field.field_extra.editorOptions;
                        }
                    }
                });
            }else {
                this.$set(this.fieldConfig, 'editorOptions', this.initialEditorOptions);
            }
        },

        mounted() {
            this.editor = Ace.edit('code-' + this.randomId);
            this.editor.setTheme(themeMonokai);
            this.editor.session.setMode('ace/mode/' + this.mode);
            this.editor.setOptions(this.aceOptions);
            if(this.value) {
                this.editor.setValue(this.value);
            }
            this.editor.session.on('change', delta => {
                this.updateValue(this.editor.session.getValue());
            })
        },

        computed: {
            aceOptions() {

                let defaultOptions = {
                    showLineNumbers: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: false,
                    enableLiveAutocompletion: false,
                    enableEmmet: true,
                };

                if(!this.fieldConfig.editorOptions.ace_options) {
                    return defaultOptions;
                }

                return Object.assign(defaultOptions, this.fieldConfig.editorOptions.ace_options);
            },
            height() {
                if(!this.fieldConfig.editorOptions.height) {
                    return '400px';
                }
                return this.fieldConfig.editorOptions.height;
            },
            mode() {
                if(!this.fieldConfig.editorOptions.mode) {
                    return 'javascript';
                }

                return this.fieldConfig.editorOptions.mode;
            }
        },



        methods: {
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                this.$emit('input', value);
            }
        }
    }
</script>
<style>
    #code {
        position: absolute;
        width: 94%;
    }
</style>
