<script lang="ts">
import { defineComponent, PropType, SetupContext } from "vue";
import {
  errorComputedProperties,
  helpTextComputedProperties,
  setupFormField,
} from "./../../composition/formField";
import { setupHasOptions } from "./../../composition/hasOptions";
import { IApiClient } from "./../../types";

export default defineComponent({
  name: "form-radio",

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );
    const { currentOptionsURL } = setupHasOptions(props, form, fieldConfig);

    let updateValue = (value: string) => {
      context.emit("update:modelValue", value);
      form.errors.clear(fieldConfig.valueField);
    };

    return {
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      currentOptionsURL,
      updateValue,
    };
  },

  props: {
    /** Form Field Props **/

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
    apiClient: {
      type: Object as PropType<IApiClient>,
    },
    children: {},

    /** Has Options Composition Props **/

    options: {
      type: Array,
      default: () => [],
    },
    optionsUrl: {
      type: String,
      default: null,
    },
    optionsUrlParams: {
      type: Object,
      default: () => ({}),
    },
    vuexPath: {
      type: String,
      default: null,
    },
    optionLabelField: {
      type: String,
      default: "name",
    },
    optionValueField: {
      type: String,
      default: "id",
    },
  },
});
</script>

<template>
  <div class="form-group">
    <label>
      <span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.fieldExtra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.fieldExtra.withIcon"
        :title="fieldConfig.fieldExtra.helpText"
      ></span>
    </label>
    <div
      class="radio"
      v-for="option in fieldConfig.options.options"
      :key="option[fieldConfig.options.optionValueField]"
    >
      <label>
        <input
          type="radio"
          :name="fieldConfig.fieldName"
          :id="
            fieldConfig.fieldName +
            '-' +
            option[fieldConfig.options.optionValueField]
          "
          :value="option[fieldConfig.options.optionValueField]"
          @click="updateValue(option[fieldConfig.options.optionValueField])"
          :checked="modelValue == option[fieldConfig.options.optionValueField]"
          :disabled="
            fieldConfig.disabled === 1 || fieldConfig.disabled === true
          "
        />
        {{ option[fieldConfig.options.optionLabelField] }}
      </label>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
