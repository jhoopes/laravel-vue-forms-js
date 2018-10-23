<template>
    <div>
        <div class="form-check form-check-inline">
            <input class="form-check-input"
                   type="checkbox" :id="fieldConfig.fieldName + '-checkbox'"
                   v-model="checked"
                   :true-value="fieldConfig.trueValue"
                   :false-value="fieldConfig.falseValue"
            >
            <label class="form-check-label" :for="fieldConfig.fieldName + '-checkbox'">{{ fieldConfig.label }}</label>
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
            'checked': function() {
                if(this.checked === this.fieldConfig.trueValue) {
                    this.$emit('input', this.fieldConfig.trueValue);
                }else {
                    this.$emit('input', this.fieldConfig.falseValue);
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
                        if(fieldExtra.falseValue) {
                            this.$set(this.fieldConfig, 'falseValue', fieldExtra.falseValue);
                        }
                    }
                });

            }else {
                this.$set(this.fieldConfig, 'trueValue', this.trueValue);
                this.$set(this.fieldConfig, 'falseValue', this.falseValue);
            }

            if(this.value) {
                this.checked = this.value;
            } else {
                this.checked = this.fieldConfig.falseValue;
            }
        }
    }
</script>
