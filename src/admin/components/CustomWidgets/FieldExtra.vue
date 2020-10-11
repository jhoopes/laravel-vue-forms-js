<template>
  <div
    v-if="fieldExtraValue"
    :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
  >
    <span class="errors" v-if="form.errors.has(this.fieldConfig.value_field)">
      {{ form.errors.get(this.fieldConfig.value_field, true) }}
    </span>
    <div v-if="!codeEditing">
      <div class="text-right">
        <button class="button" @click="codeEditing = true">
          Edit Field Extra Manually
        </button>
      </div>
      <form-checkbox
        :find-in-form="false"
        field-name="field-extra-required"
        label="Required"
        v-model="fieldExtraValue.required"
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
        <button class="button" @click="codeEditing = false">
          Close Editor
        </button>
      </div>
      <form-code
        :find-in-form="false"
        field-name="field-extra-json"
        :value="fieldExtraValue"
        @input="parseCodeFieldExtra"
      ></form-code>
    </div>
  </div>
</template>
<script>
import FormFieldMixin from "./../../../mixins/FormField";
import HasOptionsExtra from "./FieldExtraOptions/HasOptions";
import FormValidation from "./FormValidation";

export default {
  mixins: [FormFieldMixin],

  components: {
    FormValidation,
    HasOptionsExtra
  },

  data() {
    return {
      codeEditing: false
    };
  },

  computed: {
    fieldExtraValue: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      }
    },
    fieldExtraOptions() {
      switch (this.form.data.widget) {
        case "dropdown":
          return "hasOptions-extra";
        case "checkbox":
          return "checkbox-extra";
        case "radio":
          return "hasOptions-extra";
      }

      return null;
    }
  },

  methods: {
    mergeExtraOptions(updateExtraOptions) {
      this.fieldExtraValue = Object.extend(
        this.fieldExtraValue,
        updateExtraOptions
      );
    },
    parseCodeFieldExtra(newFieldExtraString) {
      try {
        let value = JSON.parse(newFieldExtraString);
        this.fieldExtraValue = value;
      } catch (err) {
        console.log(err);
      }
    }
  }
};
</script>
