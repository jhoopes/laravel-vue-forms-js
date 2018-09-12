<template>
    <div>
        <div class="form-check form-check-inline">
            <input class="form-check-input"
                   type="checkbox" :id="fieldConfig.fieldName + '-checkbox'"
                   v-model="checked"
                   :true-value="fieldConfig.checkboxValue"
                   :false-value="false"
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

        props: ['checkboxValue'],

        data() {
            return {
                checked: false,
            }
        },

        watch: {
            'checked': function() {
                if(this.checked) {
                    this.$emit('input', this.fieldConfig.checkboxValue);
                }else {
                    this.$emit('input', null);
                }
            }
        },

        created() {

            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if(field.name === this.fieldName) {
                        var fieldExtra = this.getFormFieldFieldExtra(field);

                        this.$set(this.fieldConfig, 'checkboxValue', fieldExtra.checkboxValue);
                    }
                });

            }else {
                this.$set(this.fieldConfig, 'checkboxValue', this.checkboxValue);
            }


        }
    }
</script>
