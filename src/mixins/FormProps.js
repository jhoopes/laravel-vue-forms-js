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
        saveSuccess: {
            type: Function,
            default: function(response, actionType) {
                this.$emit(actionType, response.data);
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
        }
    }

}
