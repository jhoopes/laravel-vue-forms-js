<script lang="ts">
import { guid } from "../../utilities/utils";
import { computed, defineComponent, Ref, ref, SetupContext } from "vue";
import {
  setupFormField,
  helpTextComputedProperties,
  errorComputedProperties,
} from "./../../composition/formField";

import Datepicker from "vue3-datepicker";

export default defineComponent({
  name: "form-datepicker",
  emits: ["update:modelValue"],

  components: {
    Datepicker,
  },

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );
    const guidString: Ref<string> = ref("");
    guidString.value = guid();

    const datePickerId = computed(() => {
      return guidString.value + "-datepicker";
    });

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
      datePickerId,
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
  },
});
</script>

<template>
  <div
    class="datepicker form-group"
    :id="fieldConfig.fieldName + '-date-field'"
    :class="{ 'has-error': hasError }"
  >
    <label class="form-control-label">
      <span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.fieldExtra.required">
        &nbsp;&nbsp;(*)
      </span>
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.fieldExtra.withIcon"
        :title="fieldConfig.fieldExtra.helpText"
      ></span>
    </label>
    <div>
      <div
        class="form-group date"
        :id="datePickerId"
        data-target-input="nearest"
      >
        <datepicker
          :model-value="modelValue"
          @update:modelValue="updateValue"
          class="form-control"
        ></datepicker>
        <span class="errors" v-if="hasError">
          {{ errorMessages }}
        </span>
      </div>
      <div v-if="hasHelpText">
        <span v-html="fieldConfig.fieldExtra.helpText"></span>
      </div>
    </div>
  </div>
</template>
