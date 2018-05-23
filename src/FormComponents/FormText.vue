<template>
    <div class="form-group"
         :id="fieldName + '-text-field'"
         :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
    >
        <label class="form-control-label">{{ fieldConfig.label }} <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span></label>
        <div class="col-xs-11 no-padding">
            <input type="text" class="form-control" :name="fieldConfig.fieldName" ref="formText" :value="value"
                   @input="updateValue($event.target.value)"
                   :disabled="fieldConfig.disabled === 1"
            >                       
            <span class="help-block" v-if="form.errors.has(this.fieldConfig.value_field)">
                {{ form.errors.get(this.fieldConfig.value_field, true) }}
            </span>
        </div>
        <div v-if="validateBillAccountFields(fieldConfig.field_extra)" class="col-xs-1">
            <span class="requiredbox fa fa-info-circle" :title="fieldConfig.field_extra.helpText"></span>
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
