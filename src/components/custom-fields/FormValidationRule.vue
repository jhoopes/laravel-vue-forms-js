<script lang="ts">
import {
  computed,
  ComputedRef,
  defineComponent,
  inject,
  reactive,
  SetupContext,
  toRefs,
  watch,
} from "vue";
import Collection from "./../../classes/collection";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { IStore } from "./../../types";
import { FormConfigurationStore } from "./../../store/formConfigurationStore";
import { IModel } from "./../../types/index";

interface IInternalRuleParts {
  value: string | null;
  options: string[];
}

interface IStandardValidationRule extends IModel {
  value: string;
  name: string;
  hasOptions?: boolean;
  options?: string[];
}

export default defineComponent({
  props: {
    rule: {
      type: String,
      required: true,
    },
  },

  emits: ["update:rule", "remove"],

  setup(props, context: SetupContext) {
    const store = inject("lvfStore") as IStore;
    const formConfigurationStore = store.getModule(
      "formConfiguration"
    ) as FormConfigurationStore;

    let internalRuleParts: IInternalRuleParts = reactive({
      value: null,
      options: [],
    });

    let { rule } = toRefs(props);

    // computed

    const standardValidationRules: ComputedRef<
      Collection<IStandardValidationRule>
    > = computed(() => {
      return formConfigurationStore.standardValidationRules as Collection<IStandardValidationRule>;
    });

    const selectedStandardValidationRule: ComputedRef<IStandardValidationRule | null> =
      computed(() => {
        if (!internalRuleParts || !internalRuleParts.value) {
          return null;
        }

        return standardValidationRules.value
          .filter({ value: internalRuleParts.value })
          .first();

        // return standardValidationRules.value.find(sValidationRule => {
        //   return sValidationRule.value === internalRuleParts.value;
        // });
      });

    const hasOptions = computed(() => {
      if (!selectedStandardValidationRule.value) {
        return false;
      }
      return (
        selectedStandardValidationRule.value.options &&
        selectedStandardValidationRule.value.options.length > 0
      );
    });

    const ruleOptions = computed(() => {
      if (
        !hasOptions.value ||
        !selectedStandardValidationRule.value ||
        !selectedStandardValidationRule.value?.options
      ) {
        return [];
      }

      return selectedStandardValidationRule.value.options.map(
        (optionName: string) => {
          return {
            title: optionName,
            name: optionName.charAt(0).toLowerCase() + optionName.slice(1),
          };
        }
      );
    });

    // methods

    const addOptionsString = (
      newRule: string,
      index: number,
      valueToUpdateAtIndex: string
    ) => {
      if (hasOptions.value) {
        newRule += ":";
        var optionsString = "";
        for (var x = 0; x <= ruleOptions.value?.length - 1; x++) {
          if (optionsString.length > 0) {
            optionsString += ",";
          }
          if (x === index) {
            optionsString += valueToUpdateAtIndex;
          } else if (internalRuleParts.options) {
            var existingValue = internalRuleParts.options[x];
            if (!existingValue) {
              existingValue = "";
            }

            optionsString += existingValue;
          }
        }

        newRule += optionsString;
      }

      return newRule;
    };

    const updateInternalRuleParts = () => {
      if (!props.rule) {
        internalRuleParts.value = null;
        internalRuleParts.options = [];
        return;
      }

      var valueParts = props.rule.split(":");
      let ruleValue = valueParts[0];

      if (!ruleValue) {
        internalRuleParts.value = null;
        internalRuleParts.options = [];
        return;
      }

      let stdValidationRuleType = standardValidationRules.value
        .filter({ value: ruleValue })
        .first();
      if (!stdValidationRuleType) {
        internalRuleParts.value = "other";
        internalRuleParts.options = [];
        return;
      }

      valueParts.shift();
      var valueOptions: string[] = [];
      if (valueParts.length > 0) {
        valueOptions = valueParts[0].split(",");
      }

      internalRuleParts.value = ruleValue;
      internalRuleParts.options = valueOptions;
    };

    const removeRule = () => {
      context.emit("remove");
    };

    const updateRule = (newRule: Record<string, any> | string) => {
      context.emit("update:rule", newRule);
    };

    const updateRulePart = (newRule: string) => {
      if (newRule !== "other") {
        updateRule(newRule);
      } else {
        internalRuleParts.value = "other";
      }
    };

    const updateOptionPart = (index: number, updatedValue: string) => {
      let newRule = internalRuleParts.value ?? "";
      updateRule(addOptionsString(newRule, index, updatedValue));
    };

    updateInternalRuleParts();

    watch(rule, () => {
      updateInternalRuleParts();
    });

    return {
      internalRuleParts,
      icons: {
        times: faTimes,
      },
      standardValidationRules,
      selectedStandardValidationRule,
      hasOptions,
      ruleOptions,
      removeRule,
      updateRule,
      updateRulePart,
      updateOptionPart,
    };
  },
});
</script>

<template>
  <tr>
    <td class="width: 10px;">
      <button @click="removeRule">
        <font-awesome-icon :icon="icons.times"></font-awesome-icon>
      </button>
    </td>
    <td>
      <form-select
        :find-in-form="false"
        :options="standardValidationRules.getModels()"
        option-label-field="name"
        option-value-field="value"
        field-name="rule-value"
        :modelValue="internalRuleParts.value"
        @update:modelValue="updateRulePart"
      ></form-select>
    </td>
    <td>
      <div v-if="internalRuleParts.value === 'other'">
        <form-text
          :find-in-form="false"
          field-name="other-rule"
          label="Custom Rule"
          :modelValue="rule"
          @update:modelValue="updateRule"
        ></form-text>
      </div>
      <div v-else-if="hasOptions">
        <form-text
          :find-in-form="false"
          v-for="(option, index) in ruleOptions"
          :key="option.name"
          :field-name="option.name"
          :label="option.title"
          :modelValue="internalRuleParts.options[index]"
          @update:modelValue="
            (updatedValue) => updateOptionPart(index, updatedValue)
          "
        ></form-text>
      </div>
      <div v-else>No Options</div>
    </td>
  </tr>
</template>
