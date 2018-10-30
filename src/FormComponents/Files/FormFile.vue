<template>
    <div class="existing-files row">
        <div class="file" v-for="file in files">
            <div class="file-icon">
                <div v-if="previewIcon(file)" class="thumbnail">
                    <img :src="previewIcon(file)" width="100px" />
                </div>
                <font-awesome-icon :icon="fileIcon" size="4x"></font-awesome-icon>
            </div>
            <div class="action-row">
                <span class="fa fa-download" @click="downloadFile(file)"></span>
                <span class="fa fa-close" @click="selectForDeletion(file)" v-if="disabled === 0"></span>
            </div>
            <div class="file-name">
                {{ file.original_filename }}
            </div>
        </div>
        <modal
                v-if="showFileDeleteModal"
                :isConfirm="true"
                confirmText="Confirm Delete"
                modalWidth="300px"
                @close="showFileDeleteModal = false"
                @confirmed="deleteSelectedFile">

            <span slot="header">Delete File</span>
            <div slot="body" id="measure-delete-dialog-text">Are you sure you want to delete this file?</div>
        </modal>
    </div>
</template>
<script>
    import axios from 'axios';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faFile } from '@fortawesome/free-regular-svg-icons'
    export default {

        props: ['files', 'disabled'],

        components: {
            FontAwesomeIcon
        },

        data() {
            return {
                showFileDeleteModal: false,
                deleteFile: {},
                fileIcon: faFile
            }
        },

        methods: {
            downloadFile(file) {
                window.open('/files/' + file.id + '/download');
            },
            previewIcon(file) {
                if(file.thumbnail && file.thumbnail !== null) {
                    return '/files/' + file.id + '/thumbnail'
                }

                return false;
            },
            selectForDeletion(file) {
                this.deleteFile = file;
                this.showFileDeleteModal = true;
            },
            deleteSelectedFile() {

                if(this.disabled === 1) {
                    return;
                }

                this.showFileDeleteModal = false;
                axios.delete('/api/files/' + this.deleteFile.id).then( response => {
                    this.$emit('deletedFile', this.deleteFile);
                    this.deleteFile = {};
                    window.notify.message('Successfully deleted file', 'success');
                }).catch( error => {
                    window.notify.apiError(error);
                });
            }
        }
    }
</script>
