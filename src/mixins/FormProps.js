import axios from "axios";
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
            default: "/api/forms/submit"
        },
        apiClient: {
            default() {
                return axios;
            }
        },
        saveSuccess: {
            type: Function,
            default: function(record, actionType) {
                if (this.passThru) {
                    this.$emit(actionType, record);
                } else {
                    this.$emit(actionType, record);
                }
                if (this.closeOnSave) {
                    this.close();
                }
            }
        },
        errorHandler: {
            type: Function,
            default: function(error) {
                this.form.errors.report(error);
            }
        },
        formErrors: {
            type: Object,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        closeOnSave: {
            type: Boolean,
            default: false
        },
        showCloseIcon: {
            type: Boolean,
            default: false
        },
        passThru: {
            type: Boolean,
            default: false
        },
        autoSave: {
            type: Boolean,
            default: false
        },
        autoSaveTimeout: {
            type: Number,
            default: 4000
        },
        // ability to define custom actions, custom actions will emit the action if the function does not exist on the form
        actions: {
            type: Array,
            default() {
                return [
                    {
                        name: "submit",
                        label: "Submit",
                        action: "submitForm"
                    },
                    {
                        name: "cancel",
                        label: "Cancel",
                        action: "cancelForm"
                    }
                    // {  // Left as comment for legacy purposes, but, you can still pass in these same actions and add the string to call an internal function
                    //     name: "reset",
                    //     label: "Reset",
                    //     action: "resetForm"
                    // }
                ];
            }
        },
        // whether or not to show the saving functionality
        showSaving: {
            type: Boolean,
            default: true
        },
        // allows parent components to define if its saving
        isSaving: {
            type: Boolean,
            default: false
        },
        // text to show with the spinner if it's saving
        savingText: {
            type: String,
            default: "Saving..."
        },
        useJsonApi: {
            type: Boolean,
            default: false
        },
        forceUpdate: {
            type: Boolean,
            default: false
        }
    }
};
