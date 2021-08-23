<script lang="ts">
import { defineComponent, toRefs, reactive, SetupContext, provide } from "vue";
import { Form } from "../classes/Form";

import {
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import apiClient from "./../classes/apiClient";
import { FormConfiguration } from "./../classes/models/formConfiguration";
import {
  defaultFields,
  submitForm,
  saveSuccess as saveSuccessDefault,
  setupComputed,
  setupWatchers,
  emitOrRunCustomAction,
  cancelForm,
  getFormFieldComponent,
} from "./../composition/vueForm";
import {
  IApiClient,
  ISubmitFormElements,
  IVueFormData,
  SaveSuccessFunction,
  ICustomActionFunction,
} from "./../types";
import ApiError from "./../classes/ApiError";

export default defineComponent({
  name: "vue-form",

  components: {
    FontAwesomeIcon,
  },

  setup(props, context: SetupContext) {
    let formData = defaultFields(props.formData, props.formConfig);
    let formObj = new Form(
      formData,
      props.formConfig,
      props.useJsonApi,
      props.apiClient
    );

    let { topFields, layoutType, columnCount, columnWidth } =
      setupComputed(formObj);

    let vueFormData = reactive({
      form: formObj,
      formDataWatcher: null,
      saving: false,
      spinnerIcon: faSpinner,
      warningIcon: faExclamationTriangle,
      infoIcon: faInfoCircle,
      successIcon: faCheckCircle,
      topFields,
      layoutType,
      columnCount,
      columnWidth,
    }) as unknown as IVueFormData;

    const submitFormFunc = async () => {
      vueFormData.saving = true;

      let saveSuccess: SaveSuccessFunction =
        props.saveSuccess as SaveSuccessFunction;
      if (!props.saveSuccess) {
        saveSuccess = saveSuccessDefault;
      }
      try {
        await submitForm(formObj, {
          passThru: props.passThru,
          saveSuccess,
          useJsonApi: props.useJsonApi,
          apiClient: props.apiClient as IApiClient,
          formSubmitUrl: props.formSubmitUrl,
          context,
          closeOnSave: props.closeOnSave,
        } as ISubmitFormElements);
        vueFormData.saving = false;
        formObj.errors.message = {
          type: 'success',
          message: 'Saved!'
        };

        setTimeout(() => {
          formObj.errors.message = null;
        }, 3500);
      } catch (err) {
        console.log(err.errorMessages);
        console.log(err);

        vueFormData.saving = false;
        props.errorHandler(err, formObj);
      }
    };

    provide("form", vueFormData.form);
    provide("apiClient", props.apiClient);
    provide("formHasJsonApi", props.useJsonApi);

    vueFormData.form.generateConditionValues();

    setupWatchers(vueFormData, submitFormFunc, props, context);

    const runAction = (action: string | ICustomActionFunction) => {
      if (
        typeof action === "string" &&
        (action === "submitForm" || action === "cancelForm")
      ) {
        switch (action) {
          case "submitForm":
            submitFormFunc();
            break;
          case "cancelForm":
            cancelForm(context);
            break;
        }
      } else {
        emitOrRunCustomAction(action, vueFormData.form, context);
      }
    };

    return {
      runAction,
      getFormFieldComponent,
      ...toRefs(vueFormData),
    };
  },

  props: {
    formConfig: {
      required: true,
      type: FormConfiguration,
    },
    formData: {
      required: true,
      type: Object,
    },
    formSubmitUrl: {
      type: String,
      default: "/api/forms",
    },
    apiClient: {
      default: apiClient,
    },
    saveSuccess: {
      type: Function,
    },
    errorHandler: {
      type: Function,
      default: (error: ApiError, form: Form) => {
        form.errors.report(error);
      },
    },
    formErrors: {
      type: Object,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    closeOnSave: {
      type: Boolean,
      default: false,
    },
    showCloseIcon: {
      type: Boolean,
      default: false,
    },
    passThru: {
      type: Boolean,
      default: false,
    },
    autoSave: {
      type: Boolean,
      default: false,
    },
    autoSaveTimeout: {
      type: Number,
      default: 4000,
    },
    // ability to define custom actions, custom actions will emit the action if the function does not exist on the form
    actions: {
      type: Array,
      default: () => {
        return [
          {
            name: "submit",
            label: "Submit",
            action: "submitForm",
          },
          {
            name: "cancel",
            label: "Cancel",
            action: "cancelForm",
          },
        ];
      },
    },
    // whether or not to show the saving functionality
    showSaving: {
      type: Boolean,
      default: true,
    },
    // allows parent components to define if its saving
    isSaving: {
      type: Boolean,
      default: false,
    },
    // text to show with the spinner if it's saving
    savingText: {
      type: String,
      default: "Saving...",
    },
    useJsonApi: {
      type: Boolean,
      default: false,
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
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
          'bg-blue-300': form.errors.getGeneralMessageType() === 'info',
          'bg-green-200': form.errors.getGeneralMessageType() === 'success',
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
        <font-awesome-icon
            :icon="successIcon"
            v-if="form.errors.getGeneralMessageType() === 'success'"
        ></font-awesome-icon>
        <span class="mx-4">{{ form.errors.getGeneralMessage() }}</span>
      </div>
    </div>
    <form @submit.prevent="">
      <div v-if="layoutType === 'tabs'" class="form-tabs">
        <form-tabs>
          <component
            v-for="field in topFields"
            :key="field.id"
            :name="field.label"
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
          v-for="field in topFields"
          :key="field.id"
          :is="getFormFieldComponent(field.widget)"
          v-show="field.visible && form.fieldMeetsConditions[field.name]"
          :field-name="field.name"
          :modelValue="form.getFieldValue(field)"
          @update:modelValue="
            (newVal) => form.updateValueAndConditionals(newVal, field)
          "
          @options-updated="
            (newOptions) => form.updateOptionsForField(newOptions, field)
          "
          :children="field.children || []"
          :class="columnWidth + ' ' + 'm-2'"
          :find-in-form="true"
        ></component>
      </div>
      <div
        class="controls-row"
        v-if="disabled === false && autoSave === false && layoutType !== 'tabs'"
      >
        <lvf-button
          v-for="action in actions"
          :key="action.action"
          @click.prevent="runAction(action.action)"
          :class="action.action + '-button'"
          :disabled="showSaving && saving"
        >
          <span v-html="action.label"></span>
        </lvf-button>
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
