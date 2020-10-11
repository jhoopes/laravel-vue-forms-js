<template>
  <div
    class="form-group"
    :id="fieldName + '-select-field'"
    :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
  >
    <label class="form-control-label" v-if="showLabel">
      <span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.field_extra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.field_extra.withIcon"
        :title="fieldConfig.field_extra.helpText"
      ></span>
    </label>

    <multi-select
      v-model="optionValue"
      :options="fieldConfig.options"
      :multiple="true"
      :close-on-select="false"
      :clear-on-select="false"
      :hide-selected="true"
      :preserve-search="true"
      :track-by="fieldConfig.optionValueField"
      :label="fieldConfig.optionLabelField"
      :placeholder="fieldConfig.label"
      class="form-control"
      :disabled="fieldConfig.disabled === 1 || fieldConfig.disabled === true"
      :show-labels="showMultiselectLabels"
      :select-label="selectLabel"
      :deselect-label="deselectLabel"
      :allow-empty="allowEmpty"
    >
      <template slot="tag" slot-scope="props">
        <span
          class="inline-block px-1 py-2 mr-2 mb-2 bg-grey-lighter rounded cursor-pointer"
        >
          <span>{{ props.option[fieldConfig.optionLabelField] }}</span>
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
      v-if="form.errors.has(this.fieldConfig.value_field)"
    >
      {{ form.errors.get(this.fieldConfig.value_field, true) }}
    </span>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.field_extra.helpText"></span>
    </div>
  </div>
</template>
<script>
import MultiSelect from "vue-multiselect";
import FormField from "@/mixins/FormField";
import HasOptions from "@/mixins/HasOptions";
export default {
  name: "form-multi-select",

  components: {
    MultiSelect
  },

  props: {
    showMultiselectLabels: {
      type: Boolean,
      default: true
    },
    allowEmpty: {
      type: Boolean,
      default: true
    },
    selectLabel: {
      type: String,
      default: "Press enter to select"
    },
    deselectLabel: {
      type: String,
      default: "Press enter to remove"
    }
  },

  mixins: [FormField, HasOptions],

  computed: {
    optionValue: {
      get() {
        if (
          !this.fieldConfig.options ||
          this.fieldConfig.options.length === 0 ||
          !this.value
        ) {
          return null;
        }

        var currentValue = [];
        this.fieldConfig.options.forEach(option => {
          if (this.value.includes(option[this.fieldConfig.optionValueField])) {
            currentValue.push(option);
          }
        });

        return currentValue;
      },
      set(newItems) {
        this.form.errors.clear(this.fieldConfig.value_field);
        var newValue = [];
        newItems.forEach(newItem => {
          newValue.push(newItem[this.fieldConfig.optionValueField]);
        });

        this.$emit("input", newValue);
      }
    }
  }
};
</script>
