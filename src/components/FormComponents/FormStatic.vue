<template>
  <div>
    <component
      :is="fieldConfig.staticTag"
      v-html="fieldConfig.staticText"
    ></component>
  </div>
</template>
<script>
import FormField from "@/mixins/FormField";
export default {
  props: {
    staticText: {
      type: String
    },
    staticTag: {
      type: String,
      default: "p"
    }
  },

  mixins: [FormField],

  name: "form-static",

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

          this.$set(this.fieldConfig, "staticText", fieldExtra.staticText);
          this.$set(this.fieldConfig, "staticTag", fieldExtra.staticTag);
        }
      });
    } else {
      this.$set(this.fieldConfig, "staticText", this.staticText);
      this.$set(this.fieldConfig, "staticTag", this.staticTag);
    }
  }
};
</script>
