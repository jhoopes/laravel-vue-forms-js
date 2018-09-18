import {FormErrors} from "../FormErrors";
import axios from 'axios';

export default {

    inject: {
        form: {
            default() {
                return {
                    errors: new FormErrors()
                }
            }
        },
        apiClient: {
            default() {
                return axios;
            }
        }
    },

    props: {
        label: {
            type: String
        },
        fieldName: {
            type: String,
            required: true
        },
        value: {
            required: true,
        },
        showLabel: {
            type: Boolean,
            default: true
        },
        required: {
            type: Boolean,
            default: false,
        }
    },

    data() {
        return {
            fieldConfig: {}
        }
    },

    computed: {
    	withHelpIcon() {
        	if(this.fieldConfig.field_extra.withIcon) {
    			return true;
    		} else
    			return false;
    	},

    	hasHelpText() {
    		if(this.fieldConfig.field_extra.helpText && !this.fieldConfig.field_extra.withIcon) {
    			return true;
    		} else
    			return false;
    	}
    },

    created() {

        if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
            this.form.formConfig.fields.forEach(field => {
                if(field.name === this.fieldName) {
                    this.$set(this.fieldConfig, 'fieldName', this.fieldName);

                    var fieldExtra = this.getFormFieldFieldExtra(field);
                    if(typeof fieldExtra.required === 'undefined') {
                        fieldExtra.required = false;
                    }

                    if(this.form.disabled) {
                        this.$set(this.fieldConfig, 'disabled', 1);
                    }else {
                        this.$set(this.fieldConfig, 'disabled', field.disabled);
                    }

                    if(typeof fieldExtra.default !== 'undefined' && (this.value === null || typeof this.value === 'undefined')) {
                        this.$emit('input', fieldExtra.default);
                    }

                    this.$set(this.fieldConfig, 'field_extra', fieldExtra);
                    this.$set(this.fieldConfig, 'label', field.label);
                    this.$set(this.fieldConfig, 'value_field', field.value_field);
                }
            });

        }else {
            this.$set(this.fieldConfig, 'fieldName', this.fieldName);
            this.$set(this.fieldConfig, 'field_extra', {
                required: this.required
            });
            this.$set(this.fieldConfig, 'label', this.label);
            this.$set(this.fieldConfig, 'value_field', this.fieldName);
        }
    },

    methods: {
        getFormFieldFieldExtra(field) {
            var fieldExtra = field.field_extra;
            if(!fieldExtra) {
                fieldExtra = {};
            }
            return fieldExtra;
        },
    }

}
