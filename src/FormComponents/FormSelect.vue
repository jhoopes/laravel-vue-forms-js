<template>
    <div class="form-group row"
         :id="fieldName + '-select-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }">
        <label class="col-sm-2 control-label">
            {{ fieldConfig.label }}
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
        </label>
        <div class="col-sm-10">
            <multi-select
                    :value="optionValue"
                    :options="fieldConfig.options"
                    :track-by="fieldConfig.optionValueField"
                    :label="fieldConfig.optionLabelField"
                    :placeholder="fieldConfig.label"
                    @input="updateValue"
                    class="form-control"
                    :disabled="fieldConfig.disabled === 1"
            ></multi-select>
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
    </div>
</template>
<script>
    import MultiSelect from 'vue-multiselect';
    import FormField from '../mixins/FormField';
    import HasOptions from '../mixins/HasOptions';
    import axios from 'axios';
    export default {

        components: {
            MultiSelect
        },

        mixins: [
            FormField,
            HasOptions
        ],

        methods: {
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                if(value) {
                    this.$emit('input', value[this.fieldConfig.optionValueField]);
                } else {
                    this.$emit('input', null)
                }
            },
        }

    }
</script>