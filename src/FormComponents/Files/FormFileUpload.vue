<template>
    <div class="form-file-dropzone"
         :id="dropzoneId">
        <div class="message needsclick" @click="openDropzone">
            Click here to upload files
        </div>
        <div class="or-note" @click="openDropzone">-- or --</div>
        <div class="note" @click="openDropzone">Drag files to upload</div>
    </div>
</template>
<script>
    import Dropzone from 'dropzone';

    export default {

        props: {
            type: String,
            typeId: Number,
            stepId: Number,
            metaType: String,
            maxFiles: Number,
            uploadMultiple: {
                type: Boolean,
                default: true,
            },
            uploadApiUrl: String,
        },

        data() {
            return {
                dropzone: {},
                dropzoneId: '',
                autoProcessQueue: false,
            }
        },

        created() {
            this.dropzoneId = this.randomizeId();

            if(this.typeId) {
                this.autoProcessQueue = true;
            }

        },

        watch: {
            typeId(newId) {
                this.dropzone.processQueue();
            }
        },

        mounted() {
            var headers = null;
            if(window.dropzoneHeaders) {
                headers = window.dropzoneHeaders;
            }

            this.dropzone = new Dropzone('#' + this.dropzoneId, {
                url: this.uploadApiUrl,
                autoProcessQueue: this.autoProcessQueue,
                uploadMultiple: this.uploadMultiple,
                parallelUploads: this.maxFiles,
                maxFiles: this.maxFiles,
                addRemoveLinks: true,
                headers: headers
            });

            if(this.uploadMultiple) {
                this.dropzone.on('sendingmultiple', this.handleSending);
                this.dropzone.on('successmultiple', this.handleSuccess);
            }else {
                this.dropzone.on('sending', this.handleSending);
                this.dropzone.on('success', this.handleSuccess);
            }
            this.dropzone.on('error', this.handleError);
        },


        methods: {
            handleSending(file, xhr, formData) {
                formData.append('_token', window.csrfToken);
                formData.append('fileable_type', this.type);
                formData.append('fileable_id', this.typeId);
                if(this.stepId) {
                    formData.append('step_id', this.stepId);
                }
                formData.append('meta_type', this.metaType);
            },
            handleSuccess(file, response) {


                // add logic to add the file to the files viewer
                if (Array.isArray(response.file)) { // check if there were multiple files
                    response.file.forEach(file => {
                        this.$emit('addFile', file);

                    });

                    file.forEach(dzFile => {
                        // remove the file from the dropzone element on success
                        this.dropzone.removeFile(dzFile);
                    });
                } else {
                    this.$emit('addFile', response.file);
                    // remove the file from the dropzone element on success
                    this.dropzone.removeFile(file);
                }
                window.notify.message('Successfully uploaded file', 'success');
            },
            handleError(file, response) {
                window.notify.message('Error Uploading File', 'error');
            },
            openDropzone() {
                this.dropzone.hiddenFileInput.click();
            },
            randomizeId(){
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

                for (var i = 0; i < 20; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            },
        }

    }


</script>
