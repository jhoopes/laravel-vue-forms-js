<template>
    <div>
        <div class="form-check form-check-inline">
            <input class="form-check-input"
                   type="checkbox" :id="fieldConfig.fieldName + '-checkbox'"
                   v-model="checked"
                   :true-value="fieldConfig.trueValue"
                   :false-value="fieldConfig.falseValue"
                   :disabled="fieldConfig.disabled === 1"
            >
            <label class="form-check-label" :for="fieldConfig.fieldName + '-checkbox'"><span v-html="fieldConfig.label"></span></label>
        </div>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField'
    export default {

        mixins: [FormField],
        name: 'form-checkbox',

        props: {
            trueValue: {
                default() {
                    return true;
                }
            },
            falseValue: {
                default() {
                    return false;
                }
            }
        },

        data() {
            return {
                checked: false,
            }
        },

        watch: {
            checked(newChecked) {
                if(newChecked == this.fieldConfig.trueValue) {
                    this.$emit('input', this.fieldConfig.trueValue);
                }else {
                    this.$emit('input', this.fieldConfig.falseValue);
                }
            },
            value(newValue) {
                if(newValue === this.fieldConfig.trueValue) {
                    this.checked = this.fieldConfig.trueValue;
                } else {
                    this.checked = this.fieldConfig.falseValue;
                }
            }
        },

        created() {

            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if(field.name === this.fieldName) {
                        var fieldExtra = this.getFormFieldFieldExtra(field);

                        this.$set(this.fieldConfig, 'trueValue', true);
                        if(fieldExtra.trueValue) {
                            this.$set(this.fieldConfig, 'trueValue', fieldExtra.trueValue);
                        }

                        this.$set(this.fieldConfig, 'falseValue', false);
                        if(typeof fieldExtra.falseValue !== 'undefined') {
                            this.$set(this.fieldConfig, 'falseValue', fieldExtra.falseValue);
                        }
                    }
                });

            }else {
                this.$set(this.fieldConfig, 'trueValue', this.trueValue);
                this.$set(this.fieldConfig, 'falseValue', this.falseValue);
            }

            if(typeof this.value !== 'undefined' && this.value !== null) {
                this.checked = this.value;
            } else {
                this.checked = this.fieldConfig.falseValue;
            }
        }
    }
</script>
