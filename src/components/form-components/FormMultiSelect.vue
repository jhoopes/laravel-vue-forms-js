<script lang="ts">
/** @ts-ignore **/
import MultiSelect from "vue-multiselect";

import {computed, defineComponent, PropType, SetupContext} from "vue";
import {IApiClient} from "../../types";
import {errorComputedProperties, helpTextComputedProperties, setupFormField} from "../../composition/formField";
import {setupHasOptions} from "../../composition/hasOptions";

export default defineComponent({
  name: "form-multi-select",

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

    let updateValue = (newItems: Record<string, any>[]) => {
      let newValue: any[] = [];
      newItems.forEach((newItem: Record<string, any>) => {
        newValue.push(newItem[fieldConfig.options.optionValueField]);
      });

      context.emit("update:modelValue", newValue);
      form.errors.clear(fieldConfig.valueField);
    };

    const optionValue = computed(() => {
      if (
          (!props.modelValue && props.modelValue !== 0) ||
          !Array.isArray(props.modelValue)
      ) {
        return [];
      }


      let selectedOptions: Record<string, any> = [];
      fieldConfig.options.options.forEach((option: Record<string, any>) => {
        /** @ts-ignore **/
        if (props.modelValue.indexOf(option[fieldConfig.options.optionValueField]) !== -1) {
          selectedOptions.push(option);
        }
      });

      return selectedOptions;
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
      @update:modelValue="updateValue"
      :options="fieldConfig.options.options"
      :multiple="true"
      :close-on-select="false"
      :clear-on-select="false"
      :hide-selected="true"
      :preserve-search="true"
      :track-by="fieldConfig.options.optionValueField"
      :label="fieldConfig.options.optionLabelField"
      :placeholder="fieldConfig.label"
      class="form-control"
      :disabled="fieldConfig.disabled"
      :show-labels="showMultiselectLabels"
      :select-label="selectLabel"
      :deselect-label="deselectLabel"
      :allow-empty="allowEmpty"
    >
      <template v-slot:tag="props">
        <span
          class="
            inline-block
            px-1
            py-2
            mr-2
            mb-2
            bg-grey-lighter
            rounded
            cursor-pointer
          "
        >
          <span>{{ props.option[fieldConfig.options.optionLabelField] }}</span>
          <span
            class="text-base ml-1 font-black"
            @click="props.remove(props.option)"
            >x</span
          >
        </span>
      </template>
    </multi-select>
    <span
      class="help-block"
      v-if="hasError"
    >
      {{ errorMessages }}
    </span>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.fieldExtra.helpText"></span>
    </div>
  </div>
</template>