<template>
    <div class="form-group"
         :id="fieldName + '-text-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label"><span v-html="fieldConfig.label"></span>
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div class="">
            <input
                type="text"
                class="form-control"
                :name="fieldConfig.fieldName"
                ref="formText"
                :value="value"
                @input="updateValue($event.target.value)"
                :disabled="fieldConfig.disabled === 1 || fieldConfig.disabled === true"
            >
            <span class="errors" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
        <div v-if="hasHelpText">
            <span v-html="fieldConfig.field_extra.helpText"></span>
        </div>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField';
    export default {
        mixins: [FormField],

        name: 'form-text',

        methods: {
            updateValue(value) {
                this.form.errors.clear(this.fieldConfig.value_field);
                this.$emit('input', value);
            }
        }

    }
</script>
