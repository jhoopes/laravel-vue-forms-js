<template>
    <div class="form-group">
        <label>
            {{ fieldConfig.label }}
            <span class="required" v-if="fieldConfig.field_extra.required">&nbsp;&nbsp;(*)</span>
            <span v-if="withHelpIcon()" :class="fieldConfig.field_extra.withIcon" :title="fieldConfig.field_extra.helpText"></span>
        </label>
        <div class="radio" v-for="option in fieldConfig.options" :key="option[fieldConfig.optionValueField]">
            <label>
                <input type="radio"
                       :name="fieldConfig.fieldName"
                       :id="fieldConfig.fieldName"
                       :value="option[fieldConfig.optionValueField]"
                        @click="updateValue(option[fieldConfig.optionValueField])"
                       :checked="value === option[fieldConfig.optionValueField]"
                       :disabled="fieldConfig.disabled === 1"
                >
                {{ option[fieldConfig.optionLabelField] }}
            </label>
        </div>
    </div>
</template>
<script>
    import FormField from './../mixins/FormField';
    import HasOptions from './../mixins/HasOptions';
    export default {

        name: 'form-radio',

        mixins: [ FormField, HasOptions ],

        methods: {
            updateValue(optionValue) {
                this.$emit('input', optionValue);
            }
        }

    }
</script>
