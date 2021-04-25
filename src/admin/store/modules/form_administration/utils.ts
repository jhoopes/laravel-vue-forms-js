import Vue from "vue";

export const getFieldArrayFromFields = fields => {
  var fieldArray = false;
  if (Array.isArray(fields)) {
    fieldArray = fields;
  } else if (typeof fields.getModels === "function") {
    fieldArray = fields.getModels();
  } else {
    return [];
  }

  return fieldArray;
};

export const sortFields = fields => {
  // sort children
  return fields.sort((f1, f2) => {
    if (f1.order < f2.order) {
      return -1;
    }
    if (f1.order > f2.order) {
      return 1;
    }

    return 0;
  });
};

export const getFlattenedChildrenIds = (field, fieldArray) => {
  var children = fieldArray.filter(f => f.parent_id == field.id);

  var childItems = [];
  children.forEach(child => {
    childItems.push(child.id);
    childItems.concat(getFlattenedChildrenIds(child, fieldArray));
  });

  return childItems;
};

export const getStructuredChildrenIds = (field, fieldArray, parent) => {
  var children = fieldArray.filter(f => f.parent_id == field.id);

  children = sortFields(children);
  children.forEach(child => {
    let item = {};
    Vue.set(item, "id", child.id);
    Vue.set(item, "children", []);
    getStructuredChildrenIds(child, fieldArray, item);
    parent.children.push(item);
  });
};
