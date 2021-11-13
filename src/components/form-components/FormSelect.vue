<script lang="ts">
/** @ts-ignore **/
import MultiSelect from "vue-multiselect";
import { computed, defineComponent, PropType, SetupContext } from "vue";
import {
  errorComputedProperties,
  helpTextComputedProperties,
  setupFormField,
} from "./../../composition/formField";
import { setupHasOptions } from "./../../composition/hasOptions";
import { IApiClient } from "./../../types";

export default defineComponent({
  name: "form-select",

  components: {
    MultiSelect,
  },

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );
    const { currentOptionsURL } = setupHasOptions(props, form, fieldConfig);

    let updateValue = (value: string) => {
      form.errors.clear(fieldConfig.valueField);

      if (!value) {
        context.emit("update:modelValue", null);
        return;
      }

      context.emit(
        "update:modelValue",
        value[fieldConfig.options.optionValueField]
      );
    };

    const optionValue = computed(() => {
      if (!props.modelValue && props.modelValue !== 0) {
        return "";
      }

      let selectedOption = {};
      fieldConfig.options.options.forEach((option: Record<string, any>) => {
        if (option[fieldConfig.options.optionValueField] == props.modelValue) {
          return (selectedOption = option);
        }
      });

      return selectedOption;
    });

    return {
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      currentOptionsURL,
      optionValue,
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

    /** Form Select Options **/

    showMultiselectLabels: {
      type: Boolean,
      default: true,
    },
    allowEmpty: {
      type: Boolean,
      default: true,
    },
    selectLabel: {
      type: String,
      default: "Press enter to select",
    },
    deselectLabel: {
      type: String,
      default: "Press enter to remove",
    },
  },
});
</script>
<template>
  <div
    class="form-group"
    :id="fieldName + '-select-field'"
    :class="{ 'has-error': hasError }"
  >
    <label class="form-control-label" v-if="showLabel">
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

    <multi-select
      :modelValue="optionValue"
      :options="fieldConfig.options.options"
      :track-by="fieldConfig.options.optionValueField"
      :label="fieldConfig.options.optionLabelField"
      :placeholder="fieldConfig.label"
      @update:modelValue="updateValue"
      class="form-control"
      :disabled="fieldConfig.disabled === 1 || fieldConfig.disabled === true"
      :show-labels="showMultiselectLabels"
      :select-label="selectLabel"
      :deselect-label="deselectLabel"
      :allow-empty="allowEmpty"
    ></multi-select>
    <span class="help-block" v-if="hasError">
      {{ errorMessages }}
    </span>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
