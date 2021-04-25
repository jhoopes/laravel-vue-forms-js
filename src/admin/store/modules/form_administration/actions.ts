import Parser from "@/classes/jsonapi_parser";
import FormConfiguration from "@/admin/classes/models/formConfiguration";

import { config } from "@/admin/classes/configuration";
import { client } from "@/classes/apiClient";

let apiPrefix = config.apiPrefix;
let adminApiPrefix = config.adminApiPrefix;

export const getFormConfigurationByName = (
  context,
  { formConfigName, formConfigType }
) => {
  var params = {};

  if (formConfigName) {
    params.formConfigName = formConfigName;
  }

  if (formConfigType) {
    params.formConfigType = formConfigType;
  }

  return new Promise((resolve, reject) => {
    client
      .get(apiPrefix + "/configuration", {
        params
      })
      .then(response => {
        if (response.status !== 200) {
          console.error(response);
          return;
        }

        var formConfig;
        if (context.state.useJsonApi) {
          formConfig = Parser.parseJSONAPIResponse(response.data);
          context.commit("setOrUpdateFormConfiguration", formConfig);
        } else {
          formConfig = new FormConfiguration(response.data);
          context.commit("setOrUpdateFormConfiguration", formConfig);
        }

        resolve(response.data);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const getFormConfigurationById = (
  context,
  { formConfigId, include }
) => {
  return new Promise((resolve, reject) => {
    var params = [];
    if (include && Array.isArray(include)) {
      params.include = include;
    }

    client
      .get(apiPrefix + "/configuration/" + formConfigId, {
        params
      })
      .then(response => {
        var formConfig;
        if (context.state.useJsonApi) {
          formConfig = Parser.parseJSONAPIResponse(response.data);
          context.commit("setOrUpdateFormConfiguration", formConfig);
        } else {
          formConfig = response.data;
          context.commit("setOrUpdateFormConfiguration", formConfig);
        }

        resolve(response.data);
      })
      .catch(error => {
        console.error(error.message);
        reject(error);
      });
  });
};

export const getStandardValidationRules = context => {
  return new Promise((resolve, reject) => {
    client
      .get(adminApiPrefix + "/validation_rules")
      .then(response => {
        var rules;
        if (context.state.useJsonApi) {
          rules = Parser.parseJSONAPIResponse(response.data);
        } else {
          rules = response.data;
        }
        context.commit("setStandardValidationRules", rules);
        resolve(rules);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const getFormFieldWidgetTypes = context => {
  return new Promise((resolve, reject) => {
    client
      .get(adminApiPrefix + "/widget_types")
      .then(response => {
        var types;
        if (context.state.useJsonApi) {
          types = Parser.parseJSONAPIResponse(response.data);
        } else {
          types = response.data;
        }

        context.commit("setWidgetTypes", types);
        resolve(types);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const updateFormConfigFieldOrder = (
  context,
  { formConfigurationId, formConfigurationFieldOrder }
) => {
  return new Promise((resolve, reject) => {
    client
      .patch(
        adminApiPrefix +
          "/form_configurations/" +
          formConfigurationId +
          "/form_fields/order",
        {
          formConfigurationFieldOrder
        }
      )
      .then(response => {
        var updatedFields;
        if (context.state.useJsonApi) {
          updatedFields = Parser.parseJSONAPIResponse(response.data);
        } else {
          updatedFields = response.data;
        }

        context.commit("updateFormFieldsOnFormConfig", {
          formConfigurationId,
          updatedFields
        });
        resolve(updatedFields);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const addExistingField = (
  context,
  { formConfigurationId, existingFieldId }
) => {
  return new Promise((resolve, reject) => {
    client
      .post(
        adminApiPrefix +
          "/form_configurations/" +
          formConfigurationId +
          "/form_fields",
        {
          existingFieldId
        }
      )
      .then(response => {
        var addedField;
        if (context.state.useJsonApi) {
          addedField = Parser.parseJSONAPIResponse(response.data);
        } else {
          addedField = response.data;
        }

        context.commit("addExistingFieldToFormConfig", {
          formConfigId: formConfigurationId,
          formField: addedField
        });
        resolve(addedField);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const deleteFieldPermanently = (context, formFieldId) => {
  return new Promise((resolve, reject) => {
    client
      .delete(adminApiPrefix + "/form_fields/" + formFieldId)
      .then(() => {
        context.commit("removeField", formFieldId);
        resolve(true);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const removeFieldFromForm = (
  context,
  { formConfigurationId, formFieldId }
) => {
  return new Promise((resolve, reject) => {
    client
      .delete(
        adminApiPrefix +
          "/form_configurations/" +
          formConfigurationId +
          "/form_fields/" +
          formFieldId
      )
      .then(() => {
        context.commit("removeFieldFromForm", {
          formConfigurationId,
          formFieldId
        });
        resolve(true);
      })
      .catch(error => {
        reject(error);
      });
  });
};
