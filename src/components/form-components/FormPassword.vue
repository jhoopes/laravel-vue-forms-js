<script lang="ts">
import { computed, defineComponent, SetupContext } from "vue";
import {
  setupFormField,
  helpTextComputedProperties,
} from "./../../composition/formField";

export default defineComponent({
  name: "form-text",

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);

    let updateValue = (value: string) => {
      context.emit("update:modelValue", value);
      form.errors.clear(fieldConfig.valueField);
    };

    let hasError = computed(() => {
      return form.errors.has(fieldConfig.valueField);
    });

    let errorMessages = computed(() => {
      return form.errors.get(fieldConfig.valueField, false);
    });

    return {
      form,
      fieldConfig,
      updateValue,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
    };
  },

  emits: ["update:modelValue"],

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
      default: false,
    },
    children: {},
  },
});
</script>

<template>
  <div
    class="form-group"
    :id="fieldName + '-text-field'"
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
    <div class="">
      <input
        type="password"
        class="form-control"
        :name="fieldConfig.fieldName"
        ref="formText"
        :value="modelValue"
        @input="updateValue($event.target.value)"
        :disabled="fieldConfig.disabled === 1 || fieldConfig.disabled === true"
      />
      <span class="errors" v-if="hasError">
        <ul>
          <li v-for="message in errorMessages" :key="message">
            {{ message }}
          </li>
        </ul>
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>
