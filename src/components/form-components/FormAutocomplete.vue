<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  SetupContext,
  toRefs,
  watch,
} from "vue";
import {
  setupFormField,
  helpTextComputedProperties,
  errorComputedProperties,
} from "./../../composition/formField";
import { setupHasOptions, getOptions } from "./../../composition/hasOptions";

import { faSpinner, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { IApiClient } from "./../../types";
import Collection from "./../../classes/collection";

export default defineComponent({
  components: {
    FontAwesomeIcon,
  },

  setup(props, context: SetupContext) {
    let autocompleteInput = ref<HTMLElement | null>(null);
    let searchQuery = ref("");
    let loadingResults = ref(false);
    let showResults = ref(false);
    let canAdd = ref(
      props.modelValue === null || typeof props.modelValue === "undefined"
    );

    let { form, fieldConfig } = setupFormField(props, context);
    let { withHelpIcon, hasHelpText } = helpTextComputedProperties(fieldConfig);
    let { hasError, errorMessages } = errorComputedProperties(
      form,
      fieldConfig
    );

    let { debounceTimeout } = toRefs(props);
    fieldConfig.options.debounceTimeout = debounceTimeout.value;
    if (fieldConfig.fieldExtra.debounceTimeout) {
      fieldConfig.options.debounceTimeout =
        fieldConfig.fieldExtra.debounceTimeout;
    }

    if (!fieldConfig.options.optionsUrlParams) {
      fieldConfig.options.optionsUrlParams = {};
    }

    let { currentOptionsURL } = setupHasOptions(props, form, fieldConfig, true);

    let updateValue = (value: string | null): void => {
      context.emit("update:modelValue", value);
      form.errors.clear(fieldConfig.valueField);
    };

    const closeResults = () => {
      if (!autocompleteInput.value) {
        throw new Error("Invalid autocomplete input");
      }
      autocompleteInput.value.blur();
      showResults.value = false;
    };

    let timeout: number | null;
    const handleInput = (searchQuery: string) => {
      fieldConfig.options.optionsUrlParams.q = searchQuery;
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        loadingResults.value = true;
        showResults.value = false;
        await getOptions(currentOptionsURL, fieldConfig, form);
        loadingResults.value = false;
        showResults.value = true;
      }, fieldConfig.options.debounceTimeout) as unknown as number;
    };

    // let selectedOption: Ref<null> | Ref<Record<string, any>> = ref(null);

    const selectedOption = computed(() => {
      let potentialSelectedOption: Record<string, any> | undefined;
      let options: Record<string, any>[];
      if (fieldConfig.options.options instanceof Collection) {
        options = fieldConfig.options.options.getModels();
      } else {
        options = fieldConfig.options.options;
      }

      potentialSelectedOption = options.find((option: Record<string, any>) => {
        return (
          option[fieldConfig.options.optionValueField] === props.modelValue
        );
      });

      return potentialSelectedOption;
    });

    const setOption = (option: Record<string, any>) => {
      showResults.value = false;
      searchQuery.value = "";
      canAdd.value = false;
      updateValue(option[fieldConfig.options.optionValueField]);
    };

    const removeOption = () => {
      canAdd.value = true;
      updateValue(null);
    };

    watch(searchQuery, () => {
      if (searchQuery.value.length > 0) {
        handleInput(searchQuery.value);
      } else {
        showResults.value = false;
      }
    });

    return {
      autocompleteInput,
      fieldConfig,
      withHelpIcon,
      hasHelpText,
      hasError,
      errorMessages,
      searchQuery,
      showResults,
      canAdd,
      loadingResults,
      spinnerIcon: faSpinner,
      closeIcon: faTimesCircle,
      selectedOption,
      handleInput,
      closeResults,
      setOption,
      removeOption,
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
    },
    children: {},

    apiClient: {
      type: Object as PropType<IApiClient>,
    },

    debounceTimeout: {
      type: Number,
      default: 500,
    },

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
    <div class="flex items-center" v-click-away="closeResults">
      <div
        v-if="selectedOption"
        class="
          flex-shrink-0
          nowrap
          px-2
          py-1
          rounded-lg
          shadow
          bg-gray-300
          mr-4
        "
      >
        {{ selectedOption[fieldConfig.options.optionLabelField] }} &nbsp;
        <font-awesome-icon
          @click="removeOption"
          class="cursor-pointer"
          :icon="closeIcon"
        ></font-awesome-icon>
      </div>
      <div class="relative w-full flex-shrink" v-click-away="closeResults">
        <input
          class="
            transition-colors
            duration-100
            ease-in-out
            text-gray-600
            focus:text-gray-900
            py-2
            pr-4
            pl-10
            block
            w-full
            appearance-none
            leading-normal
            border border-transparent
            rounded-lg
            text-left
            select-none
            border-gray-300
          "
          :disabled="!canAdd"
          ref="autocompleteInput"
          @keyup.esc="closeResults"
          placeholder="Start typing for search results"
          v-model="searchQuery"
        />
        <div
          class="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            pl-4
            flex
            items-center
          "
        >
          <div>
            <svg
              class="fill-current pointer-events-none text-gray-600 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              v-if="!loadingResults"
            >
              <path
                d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
              ></path>
            </svg>
            <font-awesome-icon
              v-else
              :icon="spinnerIcon"
              :spin="true"
            ></font-awesome-icon>
          </div>
        </div>
        <div
          class="
            origin-top-right
            absolute
            left-0
            mt-2
            w-full
            rounded-md
            shadow-lg
            z-50
          "
          v-if="showResults"
        >
          <div
            class="py-1 rounded-md bg-white shadow-xs"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              v-for="option in fieldConfig.options.options"
              :key="option[fieldConfig.options.optionValueField]"
              @click="setOption(option)"
            >
              {{ option[fieldConfig.options.optionLabelField] }}</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
