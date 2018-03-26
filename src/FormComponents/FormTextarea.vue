<template>
    <div class="form-group"
         :id="fieldName + '-textarea-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label">{{ fieldConfig.label }} <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span></label>
        <div>
            <textarea
                      class="form-control"
                      :name="fieldConfig.fieldName"
                      :value="value"
                      @input="updateValue($event.target.value)"
                      :disabled="fieldConfig.disabled === 1"
                      :rows="fieldConfig.rows"
                      :cols="fieldConfig.cols"
            ></textarea>
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField';
    export default {
        mixins: [FormField],

        name: 'form-textarea',

        props: {
            rows: {
                type: Number,
                default: 4
            },
            cols: {
                type: Number,
                default: 30
            }
        },


        created() {

            if(this.form && this.form.formConfig && Array.isArray(this.form.formConfig.fields)) {
                this.form.formConfig.fields.forEach(field => {
                    if (field.name === this.fieldName) {

                        var rows = 4, cols = 30;
                        var fieldExtra = this.getFormFieldFieldExtra(field);
                        if(fieldExtra.rows) {
                            rows = fieldExtra.rows;
                        }

                        if(fieldExtra.cols) {
                            cols = fieldExtra.cols;
                        }

                        this.$set(this.fieldConfig, 'rows', rows);
                        this.$set(this.fieldConfig, 'cols', cols);
                    }
                });

            }else {
                this.$set(this.fieldConfig, 'rows', this.rows);
                this.$set(this.fieldConfig, 'cols', this.cols);
            }

        },


        methods: {
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                this.$emit('input', value);
            }
        }

    }
</script>
