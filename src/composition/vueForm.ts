import Model from "./../classes/model";
import { SetupContext, watch, computed, WatchStopHandle } from "vue";
import { assignOnObject, getFieldValue } from "./../utilities/utils";
import { FormConfiguration } from "./../classes/models/formConfiguration";
import { FormField } from "./../classes/models/formField";
import { Form } from "./../classes/Form";
import Parser from "./../classes/jsonapi_parser";
import {
  HTTPMethods,
  IHTTPClientResponse,
  ISubmitFormElements,
  IVueFormData,
  SaveSuccessFunction,
  ISubmitFormFunction,
  ICustomActionFunction,
  IJSONAPIResponse,
} from "./../types/index";
import debounce from "lodash/debounce";
import ApiError from "./../classes/ApiError";
import Collection from "./../classes/collection";

/** Prop Defaults **/

export const saveSuccess: SaveSuccessFunction = (
  record: Record<string, any> | Model,
  actionType: string,
  context: SetupContext,
  passThru = false,
  closeOnSave = false
) => {
  if (passThru) {
    context.emit(actionType, record);
  } else {
    context.emit(actionType, record);
  }
  if (closeOnSave) {
    close(context);
  }
};

export const close = (context: SetupContext) => {
  context.emit("close-form");
};

export const cancelForm = (context: SetupContext) => {
  context.emit("cancel-form");
};

export const emitOrRunCustomAction = (
  action: ICustomActionFunction | string,
  form: Form,
  context: SetupContext
) => {
  if (typeof action === "function") {
    action(form);
  } else {
    context.emit("runAction", {
      action,
      form,
    });
  }
};

export const updateFormValue = (
  form: Form,
  field: FormField,
  newValue: any
) => {
  assignOnObject(form, field.value_field, newValue);
};

export const getSubmitHttpMethod = (form: Form): HTTPMethods => {
  if (form.id) {
    return HTTPMethods.PATCH;
  }

  return HTTPMethods.POST;
};

export const getSubmitData = (form: Form) => {
  const data: Record<string, any> = {};
  if (form.id) {
    data.entityId = form.id;
  }
  data.formConfigurationId = form.formConfig.id;
  data.data = form.getData();
  return data;
};

export const submitForm = async (
  form: Form,
  submitFormElements: ISubmitFormElements
) => {
  // If this form is a pass through form, run the save success for updated only to push data out of the form
  // object
  if (submitFormElements.passThru) {
    submitFormElements.saveSuccess(
      form.getData(),
      "updated",
      submitFormElements.context,
      submitFormElements.passThru,
      submitFormElements.closeOnSave
    );
    return;
  }

  let method: HTTPMethods;
  if (submitFormElements.formSubmitMethod) {
    /** @ts-ignore **/
    method = HTTPMethods[submitFormElements.formSubmitMethod];
  } else {
    method = getSubmitHttpMethod(form);
  }

  const data = getSubmitData(form);
  // TODO
  // this.saving = true;

  const options: Record<string, any> = {};
  if (submitFormElements.useJsonApi) {
    options.headers = {
      Accept: "application/vnd.api+json",
    };
  }

  const response: IHTTPClientResponse = await submitFormElements.apiClient[
    method
  ](submitFormElements.formSubmitUrl, { requestBody: data }, options);

  let record: Record<string, any> | undefined;
  if (submitFormElements.useJsonApi) {
    record = Parser.parseJSONAPIResponse(response.data as IJSONAPIResponse);
  } else {
    record = response.data;
  }

  if (method === "post" && typeof record !== "undefined") {
    // we're creating so set the response id onto the form object
    form.data.id = record.id;
    form.id = record.id;
  }

  if (typeof record !== "undefined") {
    let actionType = "updated";
    if (method === "post") {
      actionType = "created";
    }

    submitFormElements.saveSuccess(
      record,
      actionType,
      submitFormElements.context,
      submitFormElements.passThru,
      submitFormElements.closeOnSave
    );
  }
};

/** Vue Form Component Setup **/

export const defaultFields = (
  data: Record<string, any>,
  formConfig: FormConfiguration
) => {
  formConfig.fields.forEach((field) => {
    if (
      typeof getFieldValue(data, field) === "undefined" ||
      getFieldValue(data, field) === ""
    ) {
      assignOnObject(data, field.value_field, null);
      if (
        field.field_extra !== null &&
        typeof field.field_extra.default !== "undefined"
      ) {
        assignOnObject(data, field.value_field, field.field_extra.default);
      }
    }
  });

  return data;
};

export const setupComputed = (formObj: Form) => {
  const topFields = computed(() => {
    const topLevelFields: Collection<FormField> =
      formObj.formConfig.fields.filter((field: FormField) => {
        if (field.parent_id) {
          return false;
        }
        return true;
      });

    topLevelFields.forEach((topLevelField) => {
      topLevelField.children = formObj.formConfig.fields
        .filter((field: FormField) => {
          return field.parent_id === topLevelField.id;
        })
        .getModels();
    });

    return topLevelFields;
  });

  const layoutType = computed(() => {
    const tabField = topFields.value.find((field: FormField) => {
      if (field.widget === "tab") {
        return true;
      }
      return false;
    });

    if (tabField) {
      return "tabs";
    }

    return "normal";
  });

  const columnCount = computed(() => {
    let columnCount = 0;
    topFields.value.forEach((field) => {
      if (field.widget === "column") {
        columnCount++;
      }
    });

    if (columnCount === 0) {
      columnCount = 1;
    }

    return columnCount;
  });

  const columnWidth = computed(() => {
    if (columnCount.value === 0) {
      return null;
    }

    return "w-1/" + columnCount.value;
  });

  return {
    topFields,
    layoutType,
    columnCount,
    columnWidth,
  };
};

export const setupWatchers = (
  vueFormData: IVueFormData,
  submitFormFunc: ISubmitFormFunction,
  props: Record<string, any>,
  context: SetupContext
) => {
  let formDataWatcher: WatchStopHandle;
  const setupAutoSave = () => {
    formDataWatcher = watch(
      () => vueFormData.form.data,
      debounce(function () {
        submitFormFunc();
      }, props.autoSaveTimeout),
      { deep: true }
    );
  };
  if (props.autoSave) {
    setupAutoSave();
  }

  watch(
    () => vueFormData.form.data,
    (data) => {
      context.emit("changed", data);
    }
  );

  watch(
    () => props.formData,
    (newFormData) => {
      newFormData = JSON.parse(JSON.stringify(newFormData));

      if (formDataWatcher) {
        formDataWatcher();
      }

      vueFormData.form.updateData(newFormData);

      if (props.autoSave) {
        setupAutoSave();
      }
    },
    { deep: true }
  );

  watch(
    () => props.formErrors,
    (newFormErrors) => {
      if (newFormErrors && newFormErrors.fieldErrors) {
        vueFormData.form.errors.report(newFormErrors as ApiError);
      }
    },
    { deep: true }
  );

  watch(
    () => props.forceUpdate,
    (force) => {
      if (force) {
        const newFormData = JSON.parse(JSON.stringify(props.formData));

        if (formDataWatcher) {
          formDataWatcher();
        }

        vueFormData.form.clearFields();
        vueFormData.form.updateData(newFormData, true);

        if (props.autoSave) {
          setupAutoSave();
        }
      }

      context.emit("update:forceUpdate", false);
    }
  );

  watch(
    () => props.disabled,
    (disabled) => {
      vueFormData.form.disabled = disabled;
    }
  );

  watch(
    () => props.isSaving,
    (newIsSaving) => {
      if (newIsSaving) {
        vueFormData.saving = true;
        return;
      }
      vueFormData.saving = false;
    }
  );
};

export const getFormFieldComponent = (fieldWidget: string): string => {
  switch (fieldWidget) {
    case "column":
      return "form-column";
    case "tab":
      return "form-tab";
    case "static":
      return "form-static";
    case "text":
      return "form-text";
    case "autocomplete":
      return "form-autocomplete";
    case "textarea":
      return "form-textarea";
    case "dropdown":
      return "form-select";
    case "multidropdown":
      return "form-multi-select";
    case "checkbox":
      return "form-checkbox";
    case "radio":
      return "form-radio";
    case "datepicker":
      return "form-datepicker";
    case "timepicker":
      return "form-timepicker";
    case "datetimepicker":
      return "form-datetimepicker";
    case "files":
      return "form-files";
    case "wysiwyg":
      return "form-wysiwyg";
    case "code":
      return "form-code";
    default:
      return fieldWidget;
  }
};
