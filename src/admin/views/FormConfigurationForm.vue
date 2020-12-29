<template>
  <div>
    <div v-if="!loading">
      <vue-form
        v-if="formConfigForm && formConfigFormData"
        :form-config="formConfigForm"
        :form-data="formConfigFormData"
        :use-json-api="useJsonApi"
        @created="commitAndGo"
        :force-update.sync="forceUpdate"
        :api-client="$apiClient"
      ></vue-form>

      <div
        class="my-12 border-2 rounded min-h-screen p-4"
        v-if="id && formConfigFieldOrder && formFieldForm"
      >
        <h2 class="text-2xl font-semibold">Form Fields</h2>
        <div class="text-right">
          <button
            class="button my-2"
            v-if="orderChanged"
            @click="updateFieldOrder"
            :disabled="updatingFieldOrder"
          >
            <span v-if="updatingFieldOrder">
              <font-awesome-icon
                icon="spinner"
                :spin="true"
              ></font-awesome-icon>
            </span>
            Save Field Order
          </button>
          <button
            class="button my-2"
            :disabled="hasNewField"
            @click="() => showAddModal(true)"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            Add Existing Field
          </button>
          <button
            class="button my-2"
            :disabled="hasNewField"
            @click="() => showAddModal(false)"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            Add Field
          </button>
        </div>
        <nested-form-field-list
          v-model="formConfigFieldOrder"
          :form-configuration-id="formConfigFormData.id"
          @changed="orderChanged = true"
          @formFieldCreated="updateFieldOrderForNewId"
          @formFieldDeleted="removeFieldFromFieldOrder"
        ></nested-form-field-list>
      </div>
    </div>
    <div v-else class="mx-auto">
      Loading ...
    </div>
    <lvf-modal v-if="showAddFieldModal" @close="showAddFieldModal = false">
      <h2 slot="header">Add Field</h2>
      <div slot="body">
        <div class="h-32" v-if="addExistingField">
          <form-autocomplete
            field-name="existing-field"
            :value="null"
            @input="addExistingFieldToForm"
            :options-url="config.adminApiPrefix + '/form_fields'"
            :use-json-api="config.useJsonApi"
            :api-client="$apiClient"
          />
        </div>

        <form-select
          v-else
          field-name="field-type"
          label="Form Field Type"
          :value="null"
          @input="addNewField"
          :options="formFieldWidgetTypes"
          option-label-field="title"
          option-value-field="value"
        ></form-select>
      </div>
    </lvf-modal>
  </div>
</template>
<script>
import FormConfiguration from "@/admin/classes/models/formConfiguration";
import { config } from "@/admin/classes/configuration";
export default {
  inject: {
    useJsonApi: {
      default: false
    }
  },

  props: {
    id: {
      required: true
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.formConfigFormData) {
        vm.$nextTick(() => {
          vm.forceUpdate = true;
        });
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (this.formConfigFormData) {
      this.$nextTick(() => {
        this.forceUpdate = true;
      });
    }
    next();
  },

  data() {
    return {
      config,
      loading: true,
      forceUpdate: false,
      showAddFieldModal: false,
      addExistingField: false,
      orderWatcher: null,
      formConfigFieldOrder: null,
      orderChanged: false,
      updatingFieldOrder: false
    };
  },

  async mounted() {
    if (!this.formConfigForm) {
      await this.$store.dispatch("form_admin/getFormConfigurationByName", {
        formConfigName: "form_configuration_form"
      });
    }

    if (!this.formFieldForm) {
      await this.$store.dispatch("form_admin/getFormConfigurationByName", {
        formConfigName: "form_field_form"
      });
    }

    if (!this.formConfigFormData && parseInt(this.id)) {
      await this.$store.dispatch("form_admin/getFormConfigurationById", {
        formConfigId: this.id,
        include: ["fields"]
      });
    }

    await this.$store.dispatch("form_admin/getFormFieldWidgetTypes");

    var formConfigFieldOrder = this.$store.getters[
      "form_admin/getFormConfigFieldOrderForId"
    ](this.id);
    if (!formConfigFieldOrder) {
      this.$store.commit("form_admin/setFormConfigFieldOrderForId", this.id);
      formConfigFieldOrder = this.$store.getters[
        "form_admin/getFormConfigFieldOrderForId"
      ](this.id);
    }

    this.$set(
      this,
      "formConfigFieldOrder",
      JSON.parse(JSON.stringify(formConfigFieldOrder))
    );

    this.loading = false;
  },

  computed: {
    formConfigForm() {
      return this.$store.getters["form_admin/getFormConfigByName"](
        "form_configuration_form"
      );
    },
    formFieldForm() {
      return this.$store.getters["form_admin/getFormConfigByName"](
        "form_field_form"
      );
    },
    formConfigFormData() {
      if (!this.id) {
        return new FormConfiguration({
          entity_name: "form_configuration"
        });
      }

      return this.$store.getters["form_admin/getFormConfigById"](this.id);
    },
    hasNewField() {
      if (!this.formConfigFormData || !this.formConfigFormData.fields) {
        return false;
      }

      if (this.formConfigFormData.fields.filter({ id: null }).length > 0) {
        return true;
      }

      return false;
    },
    formFieldWidgetTypes() {
      return this.$store.getters["form_admin/formFieldWidgetTypes"];
    }
  },

  methods: {
    commitAndGo(newFormConfiguration) {
      this.$store.commit(
        "form_admin/setOrUpdateFormConfiguration",
        newFormConfiguration
      );
      this.$router.push({
        name: "formAdmin.form_configurations.edit",
        params: { id: newFormConfiguration.id }
      });
    },
    showAddModal(existing) {
      if (existing) {
        this.addExistingField = true;
      }

      this.showAddFieldModal = true;
    },
    addNewField(widget) {
      this.$store.commit("form_admin/addNewFieldToFormConfig", {
        formConfigId: this.formConfigFormData.id,
        widgetType: widget
      });
      let newField = this.formConfigFormData.fields.last();
      this.formConfigFieldOrder.push({
        id: newField.id,
        children: []
      });
      this.showAddFieldModal = false;
      this.addExistingField = false;
    },
    addExistingFieldToForm(existingFieldId) {
      this.$store
        .dispatch("form_admin/addExistingField", {
          formConfigurationId: this.id,
          existingFieldId
        })
        .then(() => {
          this.showAddFieldModal = false;
          this.addExistingField = false;
          this.formConfigFieldOrder.push({
            id: existingFieldId,
            children: []
          });
        });
    },
    updateFieldOrderForNewId(newFormField, formFieldList) {
      // form fields can only be added 1 at a time
      if (!formFieldList) {
        formFieldList = this.formConfigFieldOrder;
      }

      formFieldList.forEach(orderItem => {
        if (orderItem.id === null) {
          orderItem.id = newFormField.id;
        }

        this.updateFieldOrderForNewId(newFormField, orderItem.children);
      });
    },
    removeFieldFromFieldOrder(formFieldIdToRemove, formFieldList) {
      var isTopLevel = false;
      if (!formFieldList) {
        formFieldList = this.formConfigFieldOrder;
        isTopLevel = true;
      }

      var foundItem = false;
      formFieldList.forEach((orderItem, index) => {
        if (orderItem.id === formFieldIdToRemove) {
          let removingChildren = orderItem.children;
          formFieldList.splice(index, 1);
          if (removingChildren && removingChildren.length > 0) {
            formFieldList = formFieldList.concat(removingChildren);
          }
          foundItem = true;
        }
        if (!foundItem) {
          orderItem.children = this.removeFieldFromFieldOrder(
            formFieldIdToRemove,
            orderItem.children
          );
        }
      });

      if (isTopLevel) {
        this.formConfigFieldOrder = formFieldList;
        // after re-structuring, it is important to save field structure if parent was deleted/removed
        // and children were moved
        this.updateFieldOrder();
      }

      return formFieldList;
    },
    updateFieldOrder() {
      this.updatingFieldOrder = true;
      this.$store
        .dispatch("form_admin/updateFormConfigFieldOrder", {
          formConfigurationId: this.id,
          formConfigurationFieldOrder: this.formConfigFieldOrder
        })
        .then(() => {
          this.updatingFieldOrder = false;
          this.orderChanged = false;
        })
        .catch(error => {
          this.updatingFieldOrder = false;
          console.trace(error);
        });
    }
  }
};
</script>
