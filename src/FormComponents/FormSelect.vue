<template>
    <div class="form-group"
         :id="fieldName + '-select-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }">
        <label class="form-control-label">
            {{ fieldConfig.label }}
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon()" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>

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
</template>
<script>
    import MultiSelect from 'vue-multiselect';
    import FormField from './../mixins/FormField';
    import HasOptions from './../mixins/HasOptions';
    import axios from 'axios';
    export default {

        name: 'form-select',

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
