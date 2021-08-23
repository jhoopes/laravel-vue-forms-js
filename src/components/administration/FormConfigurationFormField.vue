<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  SetupContext,
} from "vue";
import config from "./../../classes/configuration";
import { ApiClient } from "./../../classes/apiClient";
import { IStore } from "./../../types";
import { FormConfigurationStore } from "./../../store/formConfigurationStore";
import { FormField } from "./../../classes/models/formField";

import {
  faChevronRight,
  faChevronDown,
  faArrowsAlt,
} from "@fortawesome/free-solid-svg-icons";

export default defineComponent({
  props: {
    fieldId: {
      type: Number,
      required: true,
    },
    formConfigurationId: {
      required: true,
      type: Number,
    },
  },

  setup(props, context: SetupContext) {
    const apiClient = inject("lvfApiClient") as ApiClient;
    const useJsonApi = inject("lvfUseJsonApi") as boolean;
    const store = inject("lvfStore") as IStore;
    const formConfigurationStore = store.getModule(
      "formConfiguration"
    ) as FormConfigurationStore;
    formConfigurationStore.api(apiClient);
    formConfigurationStore.jsonApi(useJsonApi);

    let showForm = ref(false);
    let showConfirmDelete = ref(false);
    let formFieldElement = ref<HTMLElement | null>(null);

    const field = computed(() => {
      return formConfigurationStore.getFormFieldFromId(
        props.formConfigurationId,
        props.fieldId
      );
    });

    const formUrl = computed(() => {
      return (
        config.adminApiPrefix +
        "/form_configurations/" +
        props.formConfigurationId +
        "/form_fields"
      );
    });

    const formFieldForm = computed(() => {
      return formConfigurationStore.formConfigurations.find({
        name: "form_field_form",
      });
    });

    const formFieldWidgetTypes = computed(() => {
      return formConfigurationStore.formFieldWidgetTypes;
    });

    const isStructural = computed(() => {
      if (!field.value) {
        return false;
      }

      const fieldWidgetType = formFieldWidgetTypes.value.find({
        value: field.value.widget,
      }) as Record<string, any>;
      if (!fieldWidgetType) {
        return false;
      }

      return Boolean(fieldWidgetType.structural);
    });

    const isNew = computed(() => {
      if (!field.value) {
        return false;
      }

      return !field.value.id;
    });

    onMounted(() => {
      if (
        (!field.value || !field.value.id) &&
        formFieldElement.value !== null
      ) {
        showForm.value = true;
        formFieldElement.value.scrollIntoView({ behavior: "smooth" });
      }
    });

    const updateFormField = (formField: FormField) => {
      formConfigurationStore.updateFormFieldOnFormConfig(
        props.formConfigurationId,
        props.fieldId,
        formField
      );
    };

    const formFieldCreated = (formField: FormField) => {
      updateFormField(formField);
      context.emit("formFieldCreated", formField);
    };

    const deleteField = async (permanently: boolean) => {
      let fieldId: number;
      if (permanently && props.fieldId !== 0 && field.value !== null) {
        await formConfigurationStore.deleteFieldPermanently(
          props.formConfigurationId,
          field.value.id
        );
        context.emit("formFieldDeleted", props.fieldId);
        return;
      } else if (props.fieldId !== null && field.value !== null) {
        fieldId = field.value.id;
      } else {
        fieldId = props.fieldId;
      }

      if (!fieldId) {
        formConfigurationStore.removeFieldFromConfig(
          props.formConfigurationId,
          fieldId
        );
      } else {
        await formConfigurationStore.removeFieldFromForm(
          props.formConfigurationId,
          fieldId
        );
      }

      context.emit("formFieldDeleted", props.fieldId);
    };

    return {
      showForm,
      showConfirmDelete,
      field,
      formUrl,
      formFieldForm,
      formFieldWidgetTypes,
      isStructural,
      isNew,
      updateFormField,
      formFieldCreated,
      deleteField,
      faChevronRight,
      faChevronDown,
      faArrowsAlt,
      useJsonApi,
      apiClient,
    };
  },
});
</script>
<template>
  <div class="border-2 w-full rounded" ref="formFieldElement">
    <div class="flex items-center p-2 shadow-md" @click="showForm = !showForm">
      <font-awesome-icon
        :icon="faArrowsAlt"
        class="handle cursor-pointer"
        size="lg"
      ></font-awesome-icon>
      <div
        class="
          cursor-pointer
          ml-2
          md:ml-8
          flex
          justify-between
          items-center
          w-full
        "
      >
        <div class="flex justify-around">
          <div class="mx-2">
            <font-awesome-icon
              :icon="faChevronDown"
              v-if="showForm"
              size="lg"
            ></font-awesome-icon>
            <font-awesome-icon
              :icon="faChevronRight"
              size="lg"
              v-else
            ></font-awesome-icon>
          </div>

          <span v-if="isStructural" class="px-1 text-white text-sm bg-blue-300"
            >Structural</span
          >
          <span v-if="isNew" class="px-1 text-white text-sm bg-blue-300"
            >New</span
          >
        </div>
        <div>{{ field.name }}&nbsp;</div>
        <div>
          <button class="mx-4 md:mx-2" @click.stop="showForm = true">
            <font-awesome-icon icon="edit" size="lg"></font-awesome-icon>
          </button>
          <button @click.stop="showConfirmDelete = true">
            <font-awesome-icon icon="times" size="lg"></font-awesome-icon>
          </button>
        </div>
      </div>
    </div>
    <transition name="slide">
      <div class="shadow-inner w-full p-4" v-if="showForm">
        <vue-form
          :form-config="formFieldForm"
          :form-data="field"
          :use-json-api="useJsonApi"
          :form-submit-url="formUrl"
          @cancel-form="showForm = false"
          :api-client="apiClient"
          @created="formFieldCreated"
          @updated="updateFormField"
        ></vue-form>
      </div>
    </transition>
    <lvf-modal v-if="showConfirmDelete" @close="showConfirmDelete = false">
      <template v-slot:header>
        <h2>Delete or Dissociate?</h2>
      </template>
      <template v-slot:body>
        <div>
          <p class="mb-8">
            This will remove only this field. Nested children will 'move up' one
            level to the parent's item, if applicable.
          </p>
          <div class="flex justify-around">
            <button class="button" @click="() => deleteField(true)">
              Delete Permanently
            </button>
            <button class="button" @click="() => deleteField(false)">
              Remove from Form
            </button>
          </div>
        </div>
      </template>
    </lvf-modal>
  </div>
</template>
<style>
.slide-enter-active {
  -moz-transition-duration: 0.2s;
  -webkit-transition-duration: 0.2s;
  -o-transition-duration: 0.2s;
  transition-duration: 0.2s;
  -moz-transition-timing-function: ease-in;
  -webkit-transition-timing-function: ease-in;
  -o-transition-timing-function: ease-in;
  transition-timing-function: ease-in;
}

.slide-leave-active {
  -moz-transition-duration: 0.2s;
  -webkit-transition-duration: 0.2s;
  -o-transition-duration: 0.2s;
  transition-duration: 0.2s;
  -moz-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -webkit-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  -o-transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}
</style>
