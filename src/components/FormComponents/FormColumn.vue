<template>
  <div>
    <component
      v-for="field in visibleChildren"
      :key="field.id"
      :is="getFormFieldComponent(field.widget)"
      v-show="conditionValues[field.name]"
      :field-name="field.name"
      :value="getFieldValue(form.data, field)"
      @input="newVal => updateValueAndConditionals(newVal, field)"
      @options-updated="newOptions => updateOptionsForField(newOptions, field)"
      :children="field.children || null"
    ></component>
  </div>
</template>
<script>
import FormField from "@/mixins/FormField";
import FormConfig from "@/mixins/FormConfig";
import UpdatesValuesAndConditions from "@/mixins/UpdatesValuesAndConditions";
export default {
  mixins: [FormField, FormConfig, UpdatesValuesAndConditions],
  name: "form-column",

  props: {
    children: {
      default() {
        return [];
      }
    }
  },

  created() {
    this.generateConditionValues();
  },

  computed: {
    visibleChildren() {
      return this.children.filter(child => {
        return Boolean(child.visible);
      });
    }
  }
};
</script>
