<template>
    <div class="form-group form-file-upload-container"
         :id="fieldName + '-text-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label">{{ fieldConfig.label }} <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span></label>
        <div>
            <form-file :files="value" :disabled="fieldConfig.disabled" @deletedFile="deleteFile"></form-file>
            <form-file-upload
                    v-if="showUploadContainer"
                    :type="fieldConfig.fileable_type"
                    :type-id="fieldConfig.fileable_id"
                    :meta-type="fieldConfig.fieldName"
                    :max-files="fieldConfig.maxFiles"
                    @addFile="addFile"
                    :upload-api-url="fieldConfig.fileApiUrl"
            ></form-file-upload>
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
    </div>
</template>
<script>
    import FormField from './../../mixins/FormField';
    import FormFile from './FormFile.vue';
    import FormFileUpload from './FormFileUpload.vue';
    export default {

        name: 'form-files',

        mixins: [
            FormField
        ],

        components: {
            FormFile,
            FormFileUpload
        },

        props: {
            stepId: {
                type: Number,
                default: null,
            },
            metaType: {
                type: String,
            },
            maxFiles: {
                type: Number,
                default: 100,
            },
            disabled: {
                type:Boolean,
                default: false
            },
            fileableType: {
                type: String,
            },
            fileableId: {
                type: Number
            },
            fileApiUrl: {
                type: String,
                default() {
                    return '/api/files/saveFiles'
                }
            }
        },

        data() {
            return {
                showUploadContainer: true,
            }
        },


        created() {

            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if (field.name === this.fieldName) {

                        var fieldExtra = this.getFormFieldFieldExtra(field);
                        this.$set(this.fieldConfig, 'fileable_type', this.form.formConfig.entity_model);

                        //TODO: Will need to figure out a better way to define the entity id and not
                        //TODO: hard checking id on form
                        if(this.form.id) {
                            this.$set(this.fieldConfig, 'fileable_id', this.form.id);
                        }

                        if(fieldExtra.maxFiles) {
                            this.$set(this.fieldConfig, 'maxFiles', fieldExtra.maxFiles);
                        }else {
                            this.$set(this.fieldConfig, 'maxFiles', 100);
                        }

                        if(fieldExtra.fileApiUrl) {
                            this.$set(this.fieldConfig, 'fileApiUrl', fieldExtra.fileApiUrl);
                        }else {
                            this.$set(this.fieldConfig, 'fileApiUrl', this.fileApiUrl);
                        }

                    }
                });

                this.$watch('form.id', {
                    handler: function(newFormId, oldFormId) {
                        if(newFormId !== oldFormId) {
                            this.$set(this.fieldConfig, 'fileableId', newFormId);
                        }
                    },
                    deep:true
                })
            }else {
                this.$set(this.fieldConfig, 'fileable_type', this.fileableType);
                this.$set(this.fieldConfig, 'fileable_id', this.fileableId);
                this.$set(this.fieldConfig, 'maxFiles', this.maxFiles);
                this.$set(this.fieldConfig, 'fileApiUrl', this.fileApiUrl);
            }


            this.checkIfReachedMaxFiles();
        },

        methods: {
            deleteFile(deleteFile) {
                this.$emit('input', this.value.filter( file => {
                    return file.id !== deleteFile.id
                }));

                this.checkIfReachedMaxFiles();
            },
            addFile(file) {
                var newFiles = this.value;
                newFiles.push(file);
                this.$emit('input', newFiles);

                this.checkIfReachedMaxFiles();
            },

            checkIfReachedMaxFiles() {
                if((this.value.length == this.fieldConfig.maxFiles) || this.fieldConfig.disabled === 1) {
                    this.showUploadContainer = false;
                }else {
                    this.showUploadContainer = true;
                }
            }
        }

    }
</script>
