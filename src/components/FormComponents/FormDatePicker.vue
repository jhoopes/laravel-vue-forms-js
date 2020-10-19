<template>
  <div class="datepicker form-group">
    <label class="form-control-label"
      ><span v-html="fieldConfig.label"></span>
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.field_extra.withIcon"
        :title="fieldConfig.field_extra.helpText"
      ></span>
    </label>
    <div>
      <div
        class="input-group date"
        :id="datePickerId"
        data-target-input="nearest"
      >
        <vue-ctk-date-time-picker
          :label="''"
          formatted="MM/DD/Y"
          format="MM/DD/Y"
          :value="value"
          @input="updateValue"
          :only-date="true"
          :no-header="true"
          :without-header="true"
          :auto-close="true"
          :disabled="
            fieldConfig.disabled === 1 || fieldConfig.disabled === true
          "
        ></vue-ctk-date-time-picker>
      </div>
      <div v-if="hasHelpText">
        <span v-html="fieldConfig.field_extra.helpText"></span>
      </div>
    </div>
  </div>
</template>
<script>
import { guid } from "../../utilities/utils";
import FormField from "../../mixins/FormField";
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";
export default {
  name: "form-datepicker",

  mixins: [FormField],

  components: {
    VueCtkDateTimePicker
  },

  data() {
    return {
      guid: guid(),
      datePicker: {}
    };
  },

  computed: {
    datePickerId() {
      return this.guid + "-datepicker";
    }
  },

  methods: {
    updateValue(value) {
      this.form.errors.clear(this.fieldConfig.value_field);
      this.$emit("input", value);
    }
  }
};
</script>
