<script lang="ts">
import {
  setupFormField,
  helpTextComputedProperties,
  errorComputedProperties,
} from "../../composition/formField";

import FormValidation from "./FormValidation.vue";
import HasOptionsExtra from "./HasOptionsExtra.vue";
import { defineComponent, computed, ref, SetupContext, PropType } from "vue";

export default defineComponent({
  components: {
    FormValidation,
    HasOptionsExtra,
  },

  emits: ["update:modelValue"],

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    let codeEditing = ref(false);

    const fieldExtraValue = computed({
      get: () => {
        return props.modelValue;
      },
      set: (newValue: Record<string, any>) => {
        context.emit("update:modelValue", newValue);
      },
    });

    const updateFieldExtraValue = (newValue: Record<string, any>) => {
      context.emit("update:modelValue", newValue);
    };

    const fieldExtraOptions = computed(() => {
      switch (form.data.widget) {
        case "dropdown":
        case "multidropdown":
          return "hasOptions-extra";
        case "checkbox":
          return "checkbox-extra";
        case "radio":
          return "hasOptions-extra";
      }

      return null;
    });

    const mergeExtraOptions = (updateExtraOptions: Record<string, any>) => {
      updateFieldExtraValue({
        ...(fieldExtraValue.value as Record<string, any>),
        ...updateExtraOptions,
      });
    };

    const parseCodeFieldExtra = (newFieldExtraString: string) => {
      try {
        updateFieldExtraValue(JSON.parse(newFieldExtraString));
      } catch (err) {
        console.log(err);
      }
    };

    const updateRequired = (required: boolean) => {
      mergeExtraOptions({
        required,
      });
    };

    return {
      form,
      fieldConfig,
      codeEditing,
      fieldExtraValue,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      updateFieldExtraValue,
      fieldExtraOptions,
      mergeExtraOptions,
      parseCodeFieldExtra,
      updateRequired,
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
      type: Object as PropType<Record<string, any>>,
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
      type: Number,
      default: 0,
    },
    findInForm: {
      type: Boolean,
      default: true,
    },
    useJsonApi: {
      // allow for single component use with jsonApi
      type: Boolean,
      default: false,
    },
  },
});
</script>
<template>
  <div
    v-if="fieldExtraValue"
    :class="{ 'has-error': form.errors.has(fieldConfig.value_field) }"
  >
    <span class="errors" v-if="form.errors.has(fieldConfig.value_field)">
      {{ form.errors.get(fieldConfig.value_field, true) }}
    </span>
    <div v-if="!codeEditing">
      <div class="text-right">
        <lvf-button @click="codeEditing = true">
          Edit Field Extra Manually
        </lvf-button>
      </div>
      <form-checkbox
        :find-in-form="false"
        field-name="field-extra-required"
        label="Required"
        :model-value="fieldExtraValue.required"
        @update:modelValue="updateRequired"
      ></form-checkbox>
      <form-validation
        v-model="fieldExtraValue.validation_rules"
      ></form-validation>

      <div v-if="fieldExtraOptions">
        <component
          :is="fieldExtraOptions"
          :field-extra="fieldExtraValue"
          @merge="mergeExtraOptions"
        ></component>
      </div>
    </div>

    <div v-else>
      <div class="text-right">
        <lvf-button @click="codeEditing = false"> Close Editor </lvf-button>
      </div>
      <form-code
        :find-in-form="false"
        field-name="field-extra-json"
        :model-value="JSON.stringify(fieldExtraValue)"
        @update:modelValue="parseCodeFieldExtra"
      ></form-code>
    </div>
  </div>
</template>
