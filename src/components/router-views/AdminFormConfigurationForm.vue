<script lang="ts">
import {
  defineComponent,
  ref,
  inject,
  onMounted,
  computed,
  Ref,
  watch,
} from "vue";
import { IStore } from "./../../types";
import { FormConfigurationStore } from "./../../store/formConfigurationStore";
import { ApiClient } from "./../../classes/apiClient";
import { useRouter } from "vue-router";
import config from "./../../classes/configuration";

export default defineComponent({
  props: {
    id: {
      required: true,
      type: Number,
    },
  },

  setup(props) {
    const router = useRouter();
    const loading = ref(true);
    const apiClient = inject("lvfApiClient") as ApiClient;
    const useJsonApi = inject("lvfUseJsonApi") as boolean;
    const store = inject("lvfStore") as IStore;
    const formConfigurationStore = store.getModule(
      "formConfiguration"
    ) as FormConfigurationStore;
    formConfigurationStore.api(apiClient);
    formConfigurationStore.jsonApi(useJsonApi);

    let formConfigFieldOrder: Ref<Record<string, any>[]> = ref([]);
    let showAddFieldModal = ref(false);
    let addExistingField = ref(false);
    let orderChanged = ref(false);
    let updatingFieldOrder = ref(false);

    if (!formConfigurationStore) {
      throw new Error("Form Configuration store not found in injected store.");
    }

    let formConfigForm = computed(() => {
      return formConfigurationStore.formConfigurations.find({
        name: "form_configuration_form",
      });
    });

    let formFieldForm = computed(() => {
      return formConfigurationStore.formConfigurations.find({
        name: "form_field_form",
      });
    });

    let formFieldWidgetTypes = computed(() => {
      return formConfigurationStore.formFieldWidgetTypes;
    });

    let formConfigToEdit = computed(() => {
      if (!parseInt(String(props.id))) {
        return formConfigurationStore.getDefaultFormConfiguration();
      }

      return formConfigurationStore.formConfigurations.find({ id: props.id });
    });

    const existingFormFieldLookupUrl = computed(() => {
      return config.adminApiPrefix + "/form_fields";
    });

    watch(
      formConfigFieldOrder,
      () => {
        orderChanged.value = true;
      },
      { deep: true }
    );

    // methods
    const commitAndGo = (newFormConfig: Record<string, any>) => {
      formConfigurationStore.formConfigurations.add(newFormConfig);
      router.push({
        name: "formAdmin.form_configurations.edit",
        params: { id: newFormConfig.id },
      });
    };

    const updateFormConfiguration = (
      updatedFormConfig: Record<string, any>
    ) => {
      formConfigurationStore.updateFormConfigurationModel(updatedFormConfig);
    };

    const showAddModal = (existing: boolean) => {
      if (existing) {
        addExistingField.value = true;
      }

      showAddFieldModal.value = true;
    };

    let hasNewField = ref(false);
    const addNewField = (selection: string) => {
      if (!formConfigToEdit.value) {
        return;
      }
      formConfigurationStore.addNewFieldToFormConfig(
        formConfigToEdit.value.id,
        selection
      );
      let newField = formConfigToEdit.value.fields.last();
      if (!newField) {
        throw new Error("Unable to find newly added field");
      }
      formConfigFieldOrder.value.push({
        id: newField.id,
        children: [],
      });
      showAddFieldModal.value = false;
      addExistingField.value = false;
      hasNewField.value = true;
    };

    const addExistingFieldToForm = async (selection: number) => {
      if (!formConfigToEdit.value) {
        return;
      }

      let newField = await formConfigurationStore.addExistingFieldToFormConfig(
        formConfigToEdit.value.id,
        selection
      );

      if (!newField) {
        throw new Error("Unable to find newly added field");
      }
      formConfigFieldOrder.value.push({
        id: newField.id,
        children: [],
      });
      showAddFieldModal.value = false;
      addExistingField.value = false;
    };

    const formFieldCreated = (newFormField: Record<string, any>) => {
      hasNewField.value = false;
      updateFieldOrderForNewId(newFormField);
    };

    const updateFieldOrderForNewId = (
      newFormField: Record<string, any>,
      formFieldList?: Record<string, any>[]
    ) => {
      // form fields can only be added 1 at a time
      if (!formFieldList) {
        formFieldList = formConfigFieldOrder.value;
      }

      formFieldList.forEach((orderItem) => {
        if (orderItem.id === 0) {
          orderItem.id = newFormField.id;
        }

        updateFieldOrderForNewId(newFormField, orderItem.children);
      });
    };

    const removeFieldFromFieldOrder = (
      formFieldIdToRemove: number,
      formFieldList?: Record<string, any>[]
    ) => {
      //var isTopLevel = false;
      if (!formFieldList) {
        formFieldList = formConfigFieldOrder.value;
        //isTopLevel = true;
      }

      var foundItem = false;
      formFieldList.forEach((orderItem, index) => {
        if (orderItem.id === formFieldIdToRemove) {
          let removingChildren = orderItem.children;
          /* @ts-ignore */
          formFieldList.splice(index, 1);
          if (removingChildren && removingChildren.length > 0) {
            /* @ts-ignore */
            formFieldList = formFieldList.concat(removingChildren);
          }
          foundItem = true;
        }

        if (!foundItem) {
          removeFieldFromFieldOrder(formFieldIdToRemove, orderItem.children);
        }
      });

      hasNewField.value = false;
    };

    const updateFieldOrder = async () => {
      if (!formConfigToEdit.value) {
        return;
      }

      updatingFieldOrder.value = true;
      await formConfigurationStore.updateFormConfigFieldOrder(
        formConfigToEdit.value.id,
        formConfigFieldOrder.value
      );
      updatingFieldOrder.value = false;
      orderChanged.value = false;
    };

    const closeAddFieldModal = () => {
      showAddFieldModal.value = false;
      addExistingField.value = false;
    };

    onMounted(async () => {
      loading.value = true;

      if (!formConfigForm.value) {
        await formConfigurationStore.getFormConfigurationByName(
          "form_configuration_form"
        );
      }

      if (!formFieldForm.value) {
        await formConfigurationStore.getFormConfigurationByName(
          "form_field_form"
        );
      }

      if (!formConfigToEdit.value) {
        await formConfigurationStore.getFormConfigurationById(props.id);
      }

      if (formConfigToEdit.value) {
        formConfigFieldOrder.value =
          formConfigurationStore.setFormConfigFieldOrderForFormId(
            formConfigToEdit.value.id
          );
      }

      await formConfigurationStore.getFormFieldWidgetTypes();

      loading.value = false;
    });

    return {
      loading,
      useJsonApi,
      apiClient,
      formConfigToEdit,
      formConfigForm,
      formFieldForm,
      hasNewField,
      formConfigFieldOrder,
      showAddFieldModal,
      addExistingField,
      orderChanged,
      updatingFieldOrder,
      formFieldWidgetTypes,
      existingFormFieldLookupUrl,
      commitAndGo,
      updateFormConfiguration,
      showAddModal,
      addNewField,
      addExistingFieldToForm,
      formFieldCreated,
      updateFieldOrderForNewId,
      removeFieldFromFieldOrder,
      updateFieldOrder,
      closeAddFieldModal,
    };
  },
});
</script>
<template>
  <div>
    <div v-if="!loading">
      <vue-form
        v-if="formConfigForm && formConfigToEdit"
        :form-config="formConfigForm"
        :form-data="formConfigToEdit"
        :use-json-api="useJsonApi"
        @created="commitAndGo"
        @updated="updateFormConfiguration"
        :api-client="apiClient"
      ></vue-form>

      <div
        class="my-12 border-2 rounded min-h-screen p-4"
        v-if="id && formFieldForm"
      >
        <h2 class="text-2xl font-semibold">Form Fields</h2>

        <div class="text-right">
          <lvf-button
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
          </lvf-button>
          <lvf-button
            class="button my-2"
            :disabled="hasNewField"
            @click="() => showAddModal(true)"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            Add Existing Field
          </lvf-button>
          <lvf-button
            class="button my-2"
            :disabled="hasNewField"
            @click="() => showAddModal(false)"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            Add Field
          </lvf-button>
        </div>
        <nested-form-field-list
          :list="formConfigFieldOrder"
          :form-configuration-id="formConfigToEdit.id"
          @changed="orderChanged = true"
          @formFieldCreated="formFieldCreated"
          @formFieldDeleted="removeFieldFromFieldOrder"
        ></nested-form-field-list>
      </div>
    </div>
    <div v-else class="mx-auto">Loading ...</div>
    <lvf-modal v-if="showAddFieldModal" @close="closeAddFieldModal">
      <template v-slot:header>
        <h2>Add Field</h2>
      </template>
      <template v-slot:body>
        <div class="h-32" v-if="addExistingField">
          <form-autocomplete
            field-name="existing-field"
            :model-value="null"
            @update:modelValue="addExistingFieldToForm"
            :options-url="existingFormFieldLookupUrl"
            :use-json-api="useJsonApi"
            :api-client="apiClient"
          />
        </div>

        <form-select
          v-else
          field-name="field-type"
          label="Form Field Type"
          :model-value="null"
          @update:modelValue="addNewField"
          :options="formFieldWidgetTypes.getModels()"
          option-label-field="title"
          option-value-field="value"
        ></form-select>
      </template>
    </lvf-modal>
  </div>
</template>
