<script lang="ts">
import {
  computed,
  WritableComputedRef,
  defineComponent,
  inject,
  PropType,
  SetupContext,
} from "vue";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import FormValidationRule from "./FormValidationRule.vue";
import { IStore } from "./../../types";
import { FormConfigurationStore } from "./../../store/formConfigurationStore";
import { setupFormField } from "./../../composition/formField";
export default defineComponent({
  props: {
    modelValue: {
      required: true,
      type: Array as PropType<string[]>,
    },
  },

  components: {
    FormValidationRule,
  },

  emits: ["update:ModelValue"],

  setup(props, context: SetupContext) {
    let { form, fieldConfig } = setupFormField(props, context);
    const store = inject("lvfStore") as IStore;
    const formConfigurationStore = store.getModule(
      "formConfiguration"
    ) as FormConfigurationStore;

    const standardValidationRules = computed(() => {
      return formConfigurationStore.standardValidationRules;
    });

    const validationRules: WritableComputedRef<string[]> = computed({
      get: () => {
        return props.modelValue;
      },
      set: (updatedValidationRules: string[]): void => {
        context.emit("update:modelValue", updatedValidationRules);
      },
    });

    const addRule = () => {
      validationRules.value.push("");
    };

    const updateAtIndex = (newRule: string, index: number) => {
      validationRules.value.splice(index, 1, newRule);
    };

    const removeRuleAtIndex = (index: number) => {
      validationRules.value.splice(index, 1);
    };

    formConfigurationStore.getStandardValidationRules();

    return {
      form,
      fieldConfig,
      standardValidationRules,
      validationRules,
      addRule,
      updateAtIndex,
      removeRuleAtIndex,
      icons: {
        plus: faPlus,
        spinner: faSpinner,
      },
    };
  },
});
</script>

<template>
  <div>
    <table
      class="table"
      v-if="standardValidationRules && standardValidationRules.length > 0"
    >
      <thead>
        <th></th>
        <th>Validation Rule</th>
        <th>Options</th>
      </thead>
      <tbody>
        <form-validation-rule
          v-for="(rule, index) in validationRules"
          :key="index"
          :rule="rule"
          @update:rule="(updatedRule) => updateAtIndex(updatedRule, index)"
          @remove="removeRuleAtIndex(index)"
        ></form-validation-rule>
      </tbody>
    </table>
    <div class="text-center" v-else>
      <font-awesome-icon
        :icon="icons.spinner"
        :spin="true"
        size="3x"
      ></font-awesome-icon>
    </div>
    <div class="mt-4 text-right">
      <button class="button" @click="addRule">
        <font-awesome-icon :icon="icons.plus"></font-awesome-icon> Add Rule
      </button>
    </div>
  </div>
</template>
