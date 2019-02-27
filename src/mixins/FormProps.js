import axios from 'axios';
export default {

    props: {

        formConfig: {
            required: true,
            type: Object
        },
        formData: {
            required: true,
            type: Object
        },
        formSubmitUrl: {
            type: String,
            default: '/api/forms/submit'
        },
        apiClient: {
            default() {
                return axios;
            },
        },
        saveSuccess: {
            type: Function,
            default: function(response, actionType) {

                if(this.passThru) {
                    this.$emit(actionType, response);
                } else {
                    this.$emit(actionType, response.data);
                }
                if(this.closeOnSave) {
                    this.close()
                }
            }
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        closeOnSave: {
            type: Boolean,
            default: false,
        },
        showCloseIcon: {
            type: Boolean,
            default: false,
        },
        passThru: {
            type: Boolean,
            default: false,
        },
        autoSave: {
            type: Boolean,
            default: false,
        },
        autoSaveTimeout: {
            type: Number,
            default: 4000
        },
        actions: {
            type: Array,
            default() {
                return [
                    {
                        name: 'submit',
                        label: 'Submit',
                        action: 'submitForm'
                    },
                    {
                        name: 'cancel',
                        label: 'Cancel',
                        action: 'cancelForm'
                    },
                    {
                        name: 'reset',
                        label: 'Reset',
                        action: 'resetForm'
                    }
                ]
            }
        }
    }

}
