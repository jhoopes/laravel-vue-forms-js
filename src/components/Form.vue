<template>
  <div class="vue-form">
    <div class="text-right" v-if="showCloseIcon">
      <span class="close-icon fa fa-times" @click="close"></span>
    </div>
    <div v-if="form.errors.hasGeneralMessage()">
      <div
        class="m-4 p-4 flex items-center"
        :class="{
          'bg-red-300': form.errors.getGeneralMessageType() === 'error',
          'bg-blue-300': form.errors.getGeneralMessageType() === 'info'
        }"
      >
        <font-awesome-icon
          :icon="warningIcon"
          v-if="form.errors.getGeneralMessageType() === 'error'"
        ></font-awesome-icon>
        <font-awesome-icon
          :icon="infoIcon"
          v-if="form.errors.getGeneralMessageType() === 'info'"
        ></font-awesome-icon>
        <span class="mx-4">{{ form.errors.getGeneralMessage() }}</span>
      </div>
    </div>
    <form @submit.prevent="">
      <div v-if="layoutType === 'tabs'" class="form-tabs">
        <form-tabs>
          <component
            v-for="field in fields"
            :key="field.id"
            :name="field.field_extra ? field.field_extra.name : field.name"
            :is="getFormFieldComponent(field.widget)"
            :field-name="field.name"
            :disabled="disabled"
            :auto-save="autoSave"
            :actions="actions"
            :saving="saving"
            :show-saving="showSaving"
            :saving-text="savingText"
            @runAction="runAction"
            v-show="field.visible && conditionValues[field.name]"
            :children="field.children || null"
            :class="columnWidth + ' ' + 'm-2'"
          ></component>
        </form-tabs>
      </div>
      <div :class="{ flex: columnCount > 1 }" v-else>
        <component
          v-for="field in fields"
          :key="field.id"
          :is="getFormFieldComponent(field.widget)"
          v-show="field.visible && conditionValues[field.name]"
          :field-name="field.name"
          :value="getFieldValue(form.data, field)"
          @input="newVal => updateValueAndConditionals(newVal, field)"
          @options-updated="
            newOptions => updateOptionsForField(newOptions, field)
          "
          :children="field.children || null"
          :class="columnWidth + ' ' + 'm-2'"
        ></component>
      </div>
      <div
        class="controls-row"
        v-if="disabled === false && autoSave === false && layoutType !== 'tabs'"
      >
        <button
          class="button"
          v-for="action in actions"
          :key="action.action"
          @click.prevent="runAction(action.action)"
          v-html="action.label"
          :disabled="showSaving && saving"
        ></button>
        <span v-if="saving && showSaving"
          ><font-awesome-icon
            :icon="spinnerIcon"
            :spin="true"
          ></font-awesome-icon
          >{{ savingText }}</span
        >
      </div>
      <div
        class="controls-row"
        v-if="showSaving && saving && autoSave === true"
      >
        <font-awesome-icon :icon="spinnerIcon" :spin="true"></font-awesome-icon
        >{{ savingText }}
      </div>
    </form>
  </div>
</template>
<script>
import FormProps from "@/mixins/FormProps";
import FormConfig from "@/mixins/FormConfig";
import Actions from "@/mixins/Actions";
import UpdatesValuesAndConditions from "@/mixins/UpdatesValuesAndConditions";
import { Form } from "@/classes/Form";
import FormColumn from "@/components/FormComponents/FormColumn";
import FormText from "@/components/FormComponents/FormText.vue";
import FormTextarea from "@/components/FormComponents/FormTextarea.vue";
import FormSelect from "@/components/FormComponents/FormSelect.vue";
import FormDatePicker from "@/components/FormComponents/FormDatePicker.vue";
import FormRadio from "@/components/FormComponents/FormRadio.vue";
import FormCheckbox from "@/components/FormComponents/FormCheckbox.vue";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete.vue";
import FormFiles from "@/components/FormComponents/Files/FormFiles.vue";
import { debounce } from "lodash";

import {
  faSpinner,
  faExclamationTriangle,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default {
  name: "vue-form",

  mixins: [FormProps, FormConfig, Actions, UpdatesValuesAndConditions],

  components: {
    FormColumn,
    FormText,
    FormAutocomplete,
    FormTextarea,
    FormSelect,
    FormDatePicker,
    FormRadio,
    FormCheckbox,
    FormFiles,
    FontAwesomeIcon
  },

  data() {
    return {
      form: {},
      formDataWatcher: null,
      saving: false,
      spinnerIcon: faSpinner,
      warningIcon: faExclamationTriangle,
      infoIcon: faInfoCircle
    };
  },

  created() {
    //var formData = cloneObject(this.formData);
    var formData = JSON.parse(JSON.stringify(this.formData));
    var data = this.defaultFields(formData);

    this.form = new Form(data, this.formConfig, this.disabled);
    this.generateConditionValues();

    if (this.autoSave) {
      this.setUpAutoSave();
    }

    this.$watch(
      "form.data",
      updated => {
        this.$emit("changed", updated);
      },
      { deep: true }
    );
  },

  computed: {
    fields() {
      let topLevelFields = this.formConfig.fields.filter(field => {
        if (field.parent_id) {
          return false;
        }
        return true;
      });

      topLevelFields.forEach(topLevelField => {
        topLevelField.children = this.formConfig.fields.filter(field => {
          return field.parent_id === topLevelField.id;
        });
      });

      return topLevelFields;
    },
    layoutType() {
      let tabField = this.fields.find(field => {
        if (field.widget === "tab") {
          return true;
        }
        return false;
      });

      if (tabField) {
        return "tabs";
      }

      return "normal";
    },
    columnCount() {
      var columnCount = 0;
      this.fields.forEach(field => {
        if (field.widget === "column") {
          columnCount++;
        }
      });

      if (columnCount === 0) {
        columnCount = 1;
      }

      return columnCount;
    },
    columnWidth() {
      if (this.columnCount === 0) {
        return null;
      }

      return "w-1/" + this.columnCount;
    }
  },

  provide() {
    let provide = {};

    Object.defineProperty(provide, "form", {
      enumerable: true,
      get: () => this.form
    });

    Object.defineProperty(provide, "apiClient", {
      enumerable: true,
      get: () => this.apiClient
    });

    Object.defineProperty(provide, "formHasJsonApi", {
      enumerable: true,
      get: () => this.useJsonApi
    });
    return provide;
  },

  methods: {
    setUpAutoSave() {
      this.formDataWatcher = this.$watch(
        "form.data",
        debounce(function() {
          this.submitForm();
        }, this.autoSaveTimeout),
        { deep: true }
      );
    }
  },

  watch: {
    formData: {
      handler: function(newFormData) {
        newFormData = JSON.parse(JSON.stringify(newFormData));

        if (this.formDataWatcher) {
          this.formDataWatcher();
        }

        this.form.updateData(newFormData);

        if (this.autoSave) {
          this.setUpAutoSave();
        }
      },
      deep: true
    },
    formErrors: {
      handler(newFormErrors) {
        if (newFormErrors && newFormErrors.fieldErrors) {
          this.form.errors = newFormErrors;
        }
      },
      deep: true
    },
    forceUpdate(force) {
      if (force) {
        var newFormData = JSON.parse(JSON.stringify(this.formData));

        if (this.formDataWatcher) {
          this.formDataWatcher();
        }

        this.form.clearFields();
        this.form.updateData(newFormData, true);

        if (this.autoSave) {
          this.setUpAutoSave();
        }
      }

      this.$emit("update:forceUpdate", false);
    },
    disabled(disabled) {
      this.form.disabled = disabled;
    },
    // watcher to watch if outside component is directing to show saving
    isSaving(newIsSaving) {
      if (newIsSaving) {
        this.saving = true;
      } else {
        this.saving = false;
      }
    }
  }
};
</script>
<style scoped>
.flex {
  display: flex;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>
