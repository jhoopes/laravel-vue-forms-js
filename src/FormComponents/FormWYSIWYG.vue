<template>
    <div class="form-wysiwyg form-group">
        <label class="form-control-label"><span v-html="fieldConfig.label"></span>
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div class="form-wysiwyg-editor">
            <textarea :id="fieldName + '-editor-' + randomId" :value="value"></textarea>
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
    import FormField from './../mixins/FormField';
    import { guid } from './../utilities/utils';
    import jquery from 'jquery';

    require('summernote/dist/summernote-lite');
    export default {
        name: 'form-wysiwyg',

        mixins: [FormField],

        props: {
            editorOptions: {
                type: Object,
                default: function() {return {};},
            }
        },

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
                this.$set(this.fieldConfig, 'editorOptions', this.editorOptions);
            }
        },

        computed: {
            editorOptions() {
                let vm = this;
                var defaultOptions = {
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['insert', ['hr']],
                        ['height', ['height']]
                    ],
                    callbacks: {
                        onChange: function(contents, $editable) {
                            vm.$emit('input', contents);
                        }
                    }
                };
                if(this.fieldConfig.editorOptions) {
                    return Object.assign(defaultOptions, this.fieldConfig.editorOptions);
                }

                return defaultOptions;
            }
        },

        mounted() {
            var vm = this;
            this.editor = jquery('#' + this.fieldName + '-editor-' + this.randomId).summernote(this.editorOptions);
        }
    }
</script>
<style lang="scss" scoped>

    @import "~summernote/dist/summernote-lite.css";

    .form-wysiwyg-editor {
        width: 97%;
        margin: auto;
    }

</style>
