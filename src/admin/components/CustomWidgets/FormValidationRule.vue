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
        :value="internalRuleParts.value"
        @input="updateRulePart"
      ></form-select>
    </td>
    <td>
      <div v-if="internalRuleParts.value === 'other'">
        <form-text
          :find-in-form="false"
          field-name="other-rule"
          label="Custom Rule"
          :value="rule"
          @input="updateRule"
        ></form-text>
      </div>
      <div v-else-if="hasOptions">
        <form-text
          :find-in-form="false"
          v-for="(option, index) in ruleOptions"
          :key="option.name"
          :field-name="option.name"
          :label="option.title"
          :value="internalRuleParts.options[index]"
          @input="updatedValue => updateOptionPart(index, updatedValue)"
        ></form-text>
      </div>
      <div v-else>
        No Options
      </div>
    </td>
  </tr>
</template>
<script>
import Collection from "@/classes/collection";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
export default {
  props: {
    rule: {
      required: true
    }
  },

  data() {
    return {
      internalRuleParts: {
        value: null,
        options: null
      },
      icons: {
        times: faTimes
      }
    };
  },

  created() {
    this.updateInternalRuleParts();
  },

  watch: {
    rule() {
      this.updateInternalRuleParts();
    }
  },

  computed: {
    standardValidationRules() {
      var standardOptions = JSON.parse(
        JSON.stringify(this.$store.state.form_admin.standardValidationRules)
      );

      standardOptions.push({
        name: "Other",
        value: "other"
      });

      return new Collection(standardOptions);
    },
    selectedStandardValidationRule() {
      if (
        !this.rule ||
        !this.internalRuleParts ||
        !this.internalRuleParts.value
      ) {
        return null;
      }

      return this.standardValidationRules.find(standardValidationRule => {
        return standardValidationRule.value === this.internalRuleParts.value;
      });
    },
    hasOptions() {
      if (!this.selectedStandardValidationRule) {
        return false;
      }

      return (
        this.selectedStandardValidationRule.options &&
        this.selectedStandardValidationRule.options.length > 0
      );
    },
    ruleOptions() {
      if (!this.hasOptions) {
        return [];
      }

      return this.selectedStandardValidationRule.options.map(function(
        optionName
      ) {
        return {
          title: optionName,
          name: optionName.charAt(0).toLowerCase() + optionName.slice(1)
        };
      });
    }
  },

  methods: {
    removeRule() {
      this.$emit("remove");
    },
    updateRule(newRule) {
      this.$emit("input", newRule);
    },
    updateRulePart(newRule) {
      if (newRule !== "other") {
        this.updateRule(newRule);
      } else {
        this.internalRuleParts.value = "other";
      }
    },
    updateOptionPart(index, updatedValue) {
      let newRule = this.internalRuleParts.value;
      this.updateRule(this.addOptionsString(newRule, index, updatedValue));
    },
    addOptionsString(newRule, index, valueToUpdateAtIndex) {
      if (this.hasOptions) {
        newRule += ":";
        var optionsString = "";
        for (var x = 0; x <= this.ruleOptions.length - 1; x++) {
          if (optionsString.length > 0) {
            optionsString += ",";
          }
          if (x === index) {
            optionsString += valueToUpdateAtIndex;
          } else {
            var existingValue = this.internalRuleParts.options[x];
            if (!existingValue) {
              existingValue = "";
            }

            optionsString += existingValue;
          }
        }

        newRule += optionsString;
      }

      return newRule;
    },
    updateInternalRuleParts() {
      if (!this.rule) {
        this.internalRuleParts = {
          value: null,
          options: null
        };
        return;
      }

      var valueParts = this.rule.split(":");
      let ruleValue = valueParts[0];

      if (!ruleValue) {
        this.internalRuleParts = {
          value: null,
          options: null
        };
        return;
      }

      let stdValidationRuleType = this.$store.state.form_admin.standardValidationRules
        .filter({ value: ruleValue })
        .first();
      if (!stdValidationRuleType) {
        this.internalRuleParts = {
          value: "other",
          options: null
        };
        return;
      }

      valueParts.shift();
      var valueOptions = [];
      if (valueParts.length > 0) {
        valueOptions = valueParts[0].split(",");
      }

      this.internalRuleParts = {
        value: ruleValue,
        options: valueOptions
      };
    }
  }
};
</script>
