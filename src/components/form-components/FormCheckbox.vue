<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  SetupContext,
  toRefs,
  watch,
  WatchStopHandle,
} from "vue";
import {
  errorComputedProperties,
  getFormFieldFieldExtra,
  helpTextComputedProperties,
  setupFormField,
} from "../../composition/formField";

export default defineComponent({
  name: "form-checkbox",

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    let checked: Ref<any> = ref(false);
    let watcher: Ref<WatchStopHandle> | Ref<null> = ref(null);

    let { modelValue, trueValue, falseValue } = toRefs(props);

    const setupWatcher = () => {
      watcher.value = watch(checked, (newChecked: any) => {
        if (newChecked == fieldConfig.options.trueValue) {
          context.emit("update:modelValue", fieldConfig.options.trueValue);
        } else {
          context.emit("update:modelValue", fieldConfig.options.falseValue);
        }
      });
    };

    watch(modelValue, (newValue: any) => {
      if (watcher.value) {
        watcher.value();
      }

      if (newValue === fieldConfig.options.trueValue) {
        checked.value = fieldConfig.options.trueValue;
      } else {
        checked.value = fieldConfig.options.falseValue;
      }

      setupWatcher();
    });

    if (
      props.findInForm &&
      (Array.isArray(form.formConfig.fields) ||
        typeof form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      form.formConfig.fields.forEach((field) => {
        if (field.name === props.fieldName) {
          const fieldExtra = getFormFieldFieldExtra(field);
          if (typeof fieldExtra.required === "undefined") {
            fieldExtra.required = false;
          }

          fieldConfig.options.trueValue = true;
          if (typeof fieldExtra.trueValue !== "undefined") {
            fieldConfig.options.trueValue = fieldExtra.trueValue;
          }

          fieldConfig.options.falseValue = false;
          if (typeof fieldExtra.falseValue !== "undefined") {
            fieldConfig.options.falseValue = fieldExtra.falseValue;
          }
        }
      });
    } else {
      fieldConfig.options.trueValue = trueValue.value;
      fieldConfig.options.falseValue = falseValue.value;
    }

    if (typeof props.modelValue !== "undefined" && props.modelValue !== null) {
      checked.value = modelValue.value;
    } else {
      checked.value = fieldConfig.options.falseValue;
      context.emit("update:modelValue", fieldConfig.options.falseValue);
    }

    setupWatcher();

    return {
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      checked,
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
      default: false,
    },
    children: {},

    trueValue: {
      default: () => {
        return true;
      },
    },
    falseValue: {
      default: () => {
        return false;
      },
    },
  },
});
</script>

<template>
  <div class="form-group">
    <div class="form-check form-check-inline">
      <input
        class="form-check-input"
        type="checkbox"
        :id="fieldConfig.fieldName + '-checkbox'"
        v-model="checked"
        :true-value="fieldConfig.options.trueValue"
        :false-value="fieldConfig.options.falseValue"
        :disabled="fieldConfig.disabled === 1 || fieldConfig.disabled === true"
      />
      <label class="form-check-label" :for="fieldConfig.fieldName + '-checkbox'"
        ><span v-html="fieldConfig.label"></span
      ></label>
    </div>
  </div>
</template>
