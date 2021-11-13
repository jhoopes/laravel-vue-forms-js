<script lang="ts">
import { defineComponent, SetupContext, toRefs } from "vue";
import {
  setupFormField,
  helpTextComputedProperties,
  errorComputedProperties,
  getFormFieldFieldExtra,
} from "./../../composition/formField";

export default defineComponent({
  name: "form-textarea",

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    if (
      props.findInForm &&
      (Array.isArray(form.formConfig.fields) ||
        typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      form.formConfig.fields.forEach((field) => {
        if (field.name === props.fieldName) {
          let rows = 4,
            cols = 30;
          const fieldExtra = getFormFieldFieldExtra(field);
          if (fieldExtra.rows) {
            rows = fieldExtra.rows;
          }

          if (fieldExtra.cols) {
            cols = fieldExtra.cols;
          }

          fieldConfig.options.rows = rows;
          fieldConfig.options.cols = cols;
        }
      });
    } else {
      // eslint-disable-next-line
      fieldConfig.options.rows = props.rows;
      // eslint-disable-next-line
      fieldConfig.options.cols = props.cols;
    }

    let updateValue = (value: string) => {
      context.emit("update:modelValue", value);
      form.errors.clear(fieldConfig.valueField);
    };

    return {
      form,
      fieldConfig,
      updateValue,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      ...toRefs(props),
    };
  },

  props: {
    label: {
      type: String,
    },
    fieldName: {
      type: String,
      required: true,
    },
    modelValue: {
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    findInForm: {
      type: Boolean,
      default: false,
    },
    useJsonApi: {
      type: Boolean,
    },
    children: {},

    rows: {
      type: Number,
      default: 4,
    },
    cols: {
      type: Number,
      default: 30,
    },
  },
});
</script>
<template>
  <div
    class="form-group"
    :id="fieldName + '-textarea-field'"
    :class="{ 'has-error': hasError }"
  >
    <label class="form-control-label"
      ><span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.fieldExtra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="withHelpIcon"
        :title="fieldConfig.fieldExtra.helpText"
      ></span>
    </label>
    <div>
      <textarea
        class="form-control"
        :name="fieldConfig.fieldName"
        :value="modelValue"
        @input="updateValue($event.target.value)"
        :disabled="fieldConfig.disabled"
        :rows="fieldConfig.options.rows"
        :cols="fieldConfig.options.cols"
      ></textarea>
      <span class="help-block" v-if="hasError">
        {{ errorMessages }}
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
