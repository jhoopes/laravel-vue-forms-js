import { getFieldArrayFromFields } from "./utils";

export const getFormConfigById = state => {
  return id => {
    return state.form_configurations.find(fconfig => {
      return fconfig.id === id;
    });
  };
};

export const getFormConfigByName = state => {
  return name => {
    return state.form_configurations.find(fconfig => {
      return fconfig.name === name;
    });
  };
};

export const getFormConfigFieldOrderForId = (state, getters) => {
  return formConfigId => {
    let formConfig = getters.getFormConfigById(formConfigId);
    if (!formConfig) {
      return null;
    }

    return state.formConfigFieldOrder[formConfigId];
  };
};

export const getFormFieldFromId = (state, getters) => {
  return (formConfigId, formFieldId) => {
    let formConfig = getters.getFormConfigById(formConfigId);

    if (!formConfig || !formConfig.fields) {
      throw new Error("Invalid form configuration id: " + formConfigId);
    }

    return getFieldArrayFromFields(formConfig.fields).find(
      f => f.id == formFieldId
    );
  };
};

export const formFieldWidgetTypes = state => {
  return state.widgetTypes.getModels();
};
