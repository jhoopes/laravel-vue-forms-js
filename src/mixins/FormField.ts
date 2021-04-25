import { FormErrors } from "../classes/FormErrors";
import axios from "axios";

export default {
  inject: {
    form: {
      default() {
        return {
          disabled: false,
          errors: new FormErrors()
        };
      }
    },
    apiClient: {
      default() {
        return axios;
      }
    },
    formHasJsonApi: {
      default: false
    }
  },

  props: {
    label: {
      type: String
    },
    fieldName: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Number,
      default: 0
    },
    findInForm: {
      type: Boolean,
      default: true
    },
    useJsonApi: {
      // allow for single component use with jsonApi
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      fieldConfig: {}
    };
  },

  computed: {
    withHelpIcon() {
      if (this.fieldConfig.field_extra.withIcon) {
        return true;
      } else return false;
    },

    hasHelpText() {
      if (
        this.fieldConfig.field_extra.helpText &&
        !this.fieldConfig.field_extra.withIcon
      ) {
        return true;
      } else return false;
    },
    jsonApi() {
      if (this.formHasJsonApi || this.useJsonApi) {
        return true;
      }

      return false;
    }
  },

  watch: {
    "form.disabled": function(disabled) {
      this.fieldConfig.disabled = disabled ? 1 : 0;
    },
    disabled: function(disabled) {
      this.fieldConfig.disabled = disabled ? 1 : 0;
    }
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
          this.$set(this.fieldConfig, "fieldName", this.fieldName);

          var fieldExtra = this.getFormFieldFieldExtra(field);
          if (typeof fieldExtra.required === "undefined") {
            fieldExtra.required = false;
          }

          if (this.form.disabled) {
            this.$set(this.fieldConfig, "disabled", 1);
          } else {
            this.$set(this.fieldConfig, "disabled", field.disabled);
          }

          if (
            typeof fieldExtra.default !== "undefined" &&
            (this.value === null || typeof this.value === "undefined")
          ) {
            this.$emit("input", fieldExtra.default);
          }

          if (fieldExtra.default) {
            this.$set(this.fieldConfig, "default", fieldExtra.default);
          }

          this.$set(this.fieldConfig, "field_extra", fieldExtra);
          this.$set(this.fieldConfig, "label", field.label);
          this.$set(this.fieldConfig, "value_field", field.value_field);
        }
      });
    } else {
      this.$set(this.fieldConfig, "fieldName", this.fieldName);
      this.$set(this.fieldConfig, "field_extra", {
        required: this.required
      });
      this.$set(this.fieldConfig, "label", this.label);
      this.$set(this.fieldConfig, "value_field", this.fieldName);
      this.$set(this.fieldConfig, "disabled", this.disabled ? 1 : 0);
    }
  },

  methods: {
    getFormFieldFieldExtra(field) {
      var fieldExtra = field.field_extra;
      if (!fieldExtra) {
        fieldExtra = {};
      }
      return fieldExtra;
    }
  }
};
