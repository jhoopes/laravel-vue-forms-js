<template>
  <div class="timepicker form-group">
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
        :id="timePickerId"
        data-target-input="nearest"
      >
        <vue-ctk-date-time-picker
          :label="''"
          :formatted="valueFormat"
          :format="timeFormat"
          :time-format="timeFormat"
          :value="value"
          @input="updateValue"
          :only-time="true"
          :no-header="true"
          :minute-interval="timePickerInterval"
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
  name: "form-timepicker",

  mixins: [FormField],

  components: {
    VueCtkDateTimePicker
  },

  props: {
    minuteInterval: {
      type: String
    },
    valueFormat: {
      type: String
    },
    timeFormat: {
      type: String
    }
  },

  data() {
    return {
      guid: guid(),
      datePicker: {},
      time: null
    };
  },

  created() {
    if (
      this.findInForm &&
      this.form &&
      this.form.formConfig &&
      (Array.isArray(this.form.formConfig.fields) ||
        typeof this.form.formConfig.fields[Symbol.iterator] === "function")
    ) {
      this.form.formConfig.fields.forEach(field => {
        if (field.name === this.fieldName) {
          var fieldExtra = this.getFormFieldFieldExtra(field);

          this.$set(this.fieldConfig, "minuteInterval", null);
          if (fieldExtra.minuteInterval) {
            this.$set(
              this.fieldConfig,
              "minuteInterval",
              fieldExtra.minuteInterval
            );
          }

          this.$set(this.fieldConfig, "valueFormat", null);
          if (fieldExtra.minuteInterval) {
            this.$set(this.fieldConfig, "valueFormat", fieldExtra.valueFormat);
          }

          this.$set(this.fieldConfig, "timeFormat", null);
          if (fieldExtra.minuteInterval) {
            this.$set(this.fieldConfig, "timeFormat", fieldExtra.timeFormat);
          }
        }
      });
    } else {
      this.$set(this.fieldConfig, "minuteInterval", this.minuteInterval);
      this.$set(this.fieldConfig, "valueFormat", this.valueFormat);
      this.$set(this.fieldConfig, "timeFormat", this.timeFormat);
    }
  },

  computed: {
    timePickerId() {
      return this.guid + "-timepicker";
    },
    timePickerInterval() {
      if (this.fieldConfig.minuteInterval) {
        return parseInt(this.fieldConfig.minuteInterval);
      }

      return 10;
    }
  },

  methods: {
    updateValue(value) {
      this.$emit("input", value);
    }
  }
};
</script>
