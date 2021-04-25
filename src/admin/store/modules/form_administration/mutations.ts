import Vue from "vue";
import FormField from "@/admin/classes/models/formField";
import { getFieldArrayFromFields, getStructuredChildrenIds } from "./utils";
// import { getChildrenIds, sortFields, getFieldArrayFromFields } from "./utils";

export const setUseJsonApi = (state, useJsonApi) => {
  state.useJsonApi = useJsonApi;
};

export const setStandardValidationRules = (state, rules) => {
  state.standardValidationRules = rules;
};

export const setWidgetTypes = (state, types) => {
  state.widgetTypes = types;
};

export const setOrUpdateFormConfiguration = (state, formConfig) => {
  let existingFormConfig = state.form_configurations
    .filter({ id: formConfig.id })
    .first();

  if (existingFormConfig) {
    existingFormConfig.assign(formConfig);
    return;
  }

  state.form_configurations.add(formConfig);
};

export const addNewFieldToFormConfig = (
  state,
  { formConfigId, widgetType }
) => {
  let formConfiguration = state.form_configurations
    .filter({ id: formConfigId })
    .first();

  if (!formConfiguration) {
    throw new Error("Invalid form configuration id: " + formConfigId);
  }

  formConfiguration.ensureRelationshipIsSet("fields");
  formConfiguration.fields.add(new FormField({ widget: widgetType }));
};

export const addExistingFieldToFormConfig = (
  state,
  { formConfigId, formField }
) => {
  let formConfiguration = state.form_configurations
    .filter({ id: formConfigId })
    .first();

  if (!formConfiguration) {
    throw new Error("Invalid form configuration id: " + formConfigId);
  }

  formConfiguration.ensureRelationshipIsSet("fields");
  formConfiguration.fields.add(formField);
};

export const updateFormFieldOnFormConfig = (
  state,
  { formConfigId, formFieldId, formField }
) => {
  let formConfiguration = state.form_configurations
    .filter({ id: formConfigId })
    .first();

  if (!formConfiguration) {
    throw new Error("Invalid form configuration id: " + formConfigId);
  }

  var field = formConfiguration.fields.filter({ id: formFieldId }).first();

  if (!field) {
    throw new Error("Invalid form field to update");
  }

  field.assign(formField);
};

export const updateFormFieldsOnFormConfig = (
  state,
  { formConfigurationId, updatedFields }
) => {
  let formConfiguration = state.form_configurations
    .filter({ id: formConfigurationId })
    .first();

  if (!formConfiguration) {
    throw new Error("Invalid form configuration id: " + formConfigurationId);
  }

  if (updatedFields._uid) {
    updatedFields.getModels().forEach(updatedField => {
      let currentField = formConfiguration.fields
        .filter({ id: updatedField.id })
        .first();

      if (!currentField) {
        return;
      }

      currentField.assign(updatedField);
    });
  }
};

export const removeField = (state, formfieldId) => {
  state.form_configurations.getModels().forEach(fConfig => {
    let formField = fConfig.fields.filter({ id: formfieldId }).first();
    if (formField) {
      fConfig.fields.remove(formField);
    }
  });
};

export const removeFieldFromForm = (
  state,
  { formConfigurationId, formFieldId }
) => {
  let formConfiguration = state.form_configurations
    .filter({ id: formConfigurationId })
    .first();

  if (!formConfiguration || !formConfiguration.fields) {
    throw new Error("Invalid form configuration id: " + formConfigurationId);
  }

  let formField = formConfiguration.fields.filter({ id: formFieldId }).first();
  formConfiguration.fields.remove(formField);
};

export const setFormConfigFieldOrderForId = (state, formConfigId) => {
  let formConfig = state.form_configurations
    .filter({ id: formConfigId })
    .first();

  if (!formConfig || !formConfig.fields) {
    return [];
  }

  Vue.set(state.formConfigFieldOrder, formConfigId, []);
  var fieldArray = getFieldArrayFromFields(formConfig.fields);

  // push all root fields first to ensure they are present for parsing children
  fieldArray
    .filter(field => {
      return !field.parent_id;
    })
    .forEach(field => {
      let item = {};
      Vue.set(item, "id", field.id);
      Vue.set(item, "children", []);
      getStructuredChildrenIds(field, fieldArray, item);

      state.formConfigFieldOrder[formConfigId].push(item);
    });
};

// export const updateFormFieldParentAndOrderForFormConfigId = (state, {formConfigId, fieldWithChildren}) => {
//
//     var x = 0;
//
//     let formConfiguration = state.form_configurations
//         .filter({ id: formConfigId })
//         .first();
//
//     if (!formConfiguration || !formConfiguration.fields) {
//         throw new Error("Invalid form configuration id: " + formConfigId);
//     }
//     var fieldArray = getFieldArrayFromFields(formConfiguration.fields);
//     if(!fieldArray.length) {
//         throw new Error("Invalid field set to update");
//     }
//
//     let currentMainChildren = fieldArray.filter(f => f.parent_id == fieldWithChildren.field.id);
//
//     // update fields with new parent if not currently set
//     fieldWithChildren.children.filter(nC => currentMainChildren.findIndex(cMC => cMC.id == nC.id) === -1).forEach(newChild => {
//         newChild.parent_id = fieldWithChildren.field.id;
//     });
//
//     // remove parent id if it is set to the same as the current
//     currentMainChildren.filter(cMC => fieldWithChildren.children.findIndex(nC => nC.id == cMC.id) === -1).forEach(removeChild => {
//         removeChild.parent_id = null;
//     })
//
//     // update order
//     // loop through field array that's sorted by order, if field array item is in the new set, don't order it yet until we reach the main field's item
//     // this loop should have an "order counter" counting up each time we "push" a new field's order down.
//     // once we reach the main field's item, we can then count up with the order of its children
//     // after all children's order is updated with that pushed item we then continue on in the field array until empty
//
//
//     // get all ids that are affected by the children, children's children and so on
//     var updatingOrderIds = [];
//     fieldWithChildren.children.forEach(nC => {
//         updatingOrderIds.push(nC.id);
//         updatingOrderIds.concat(getChildrenIds(nC, fieldArray));
//     })
//
//     // unique-ify our array
//     updatingOrderIds = [...new Set(updatingOrderIds)];
//     var orderCount = 1;
//     sortFields(fieldArray).forEach(field => {
//
//
//
//
//     })
//
//
//
//
// }
