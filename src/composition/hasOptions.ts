import { Form } from "./../classes/Form";
import { IFormFieldFieldConfig } from "./../types";
import { FormField } from "./../classes/models/formField";
import { computed, reactive, Ref } from "vue";
import get from "lodash/get";
import parser from "./../classes/jsonapi_parser";
import Collection from "./../classes/collection";
import Model from "./../classes/model";

export const setupHasOptions = (
  props: Record<string, any>,
  form: Form,
  fieldConfig: IFormFieldFieldConfig,
  ensureSelected = false
) => {
  const fieldsToWatch: string[] = reactive([]);

  if (
    props.findInForm &&
    (Array.isArray(form.formConfig.fields) ||
      typeof form.formConfig.fields[Symbol.iterator] === "function")
  ) {
    const field = form.formConfig.fields.find(
      (field: FormField) => field.name === props.fieldName
    );

    if (field) {
      if (
        !field.field_extra.options_config ||
        (field.field_extra.options_config.vuex_store_path &&
          field.field_extra.options_config.vuex_getter_path)
      ) {
        throw new Error("Invalid field configuration for field: " + field.name);
      }

      fieldConfig.options.options = [];
      fieldConfig.options.optionsUrlParams = {};

      if (field.field_extra.options_config.optionsURL) {
        fieldConfig.options.optionsURL =
          field.field_extra.options_config.optionsURL;
        const pattern = /:([^:]*):/g;
        const matches = pattern.exec(fieldConfig.options.optionsURL);
        matches?.forEach((match: string) => {
          fieldsToWatch.push(match);
        });
      }

      if (field.field_extra.options_config.optionsUrlParams) {
        fieldConfig.options.optionsUrlParams =
          field.field_extra.options_config.optionsUrlParams;
      }

      if (field.field_extra.options_config.options) {
        fieldConfig.options.options = field.field_extra.options_config.options;

        form.setFormFieldOptions(
          fieldConfig.valueField,
          field.field_extra.options_config.options as Record<string, any>[]
        );
      }

      fieldConfig.options.optionValueField = "id";
      fieldConfig.options.optionLabelField = "name";

      if (field.field_extra.options_config.optionValueField) {
        fieldConfig.options.optionValueField =
          field.field_extra.options_config.optionValueField;
      }

      if (field.field_extra.options_config.optionLabelField) {
        fieldConfig.options.optionLabelField =
          field.field_extra.options_config.optionLabelField;
      }

      if (field.field_extra.options_config.default) {
        fieldConfig.default = field.field_extra.options_config.default;
      }
    }
  } else {
    fieldConfig.options.options = props.options;
    fieldConfig.options.optionValueField = props.optionValueField;
    fieldConfig.options.optionLabelField = props.optionLabelField;
    fieldConfig.options.optionsURL = props.optionsUrl;
    fieldConfig.options.optionsUrlParams = props.optionsUrlParams;
  }

  const { currentOptionsURL } = setupComputedOptionsVars(
    fieldConfig,
    form,
    fieldsToWatch,
    ensureSelected,
    props
  );
  getOptions(currentOptionsURL, fieldConfig, form);

  return {
    currentOptionsURL,
  };
};

const paramsAreEmpty = (params: Record<string, any>) => {
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) return false;
  }
  return true;
};

export const setupComputedOptionsVars = (
  fieldConfig: IFormFieldFieldConfig,
  form: Form,
  fieldsToWatch: string[],
  ensureSelected: boolean,
  props: Record<string, any>
) => {
  const currentOptionsURL = computed((): string => {
    if (fieldConfig.options.optionsURL) {
      let optionsURL = fieldConfig.options.optionsURL;
      fieldsToWatch.forEach((match) => {
        let fieldValue = get(form.data, match[1], "");
        if (!fieldValue) {
          fieldValue = "";
        }
        optionsURL = optionsURL.replace(match[0], fieldValue);
      });

      if (!paramsAreEmpty(fieldConfig.options.optionsUrlParams)) {
        let queryString = Object.keys(fieldConfig.options.optionsUrlParams)
          .map((key) => key + "=" + fieldConfig.options.optionsUrlParams[key])
          .join("&");

        if (ensureSelected && props.modelValue) {
          queryString += "&selected=" + props.modelValue;
        }

        optionsURL += "?" + queryString;
      } else if (ensureSelected && props.modelValue) {
        optionsURL += "?selected=" + props.modelValue;
      }

      return optionsURL;
    }
    return "";
  });

  return {
    currentOptionsURL,
  };
};

export const getOptions = async (
  currentOptionsUrl: Ref<string>,
  fieldConfig: IFormFieldFieldConfig,
  form: Form
): Promise<void> => {
  if (!currentOptionsUrl.value || currentOptionsUrl.value.length === 0) {
    return;
  }

  const response = await form.apiClient.get(currentOptionsUrl.value);
  let options = response.data;
  if (form.useJsonApi) {
    const optionsCollection = parser.parseJSONAPIResponse(
      response.data
    ) as Collection<Model>;

    options = optionsCollection.getModels();
  }

  let formOptions = options;
  if (options instanceof Collection) {
    formOptions = options.getModels();
  }

  form.setFormFieldOptions(
    fieldConfig.valueField,
    formOptions as Record<string, any>[]
  );
  fieldConfig.options.options = options;
};
