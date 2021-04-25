import { App } from "vue";
import { Form } from "./classes/Form";
import { FormErrors } from "./classes/FormErrors";
import { byString, assignOnObject } from "./utilities/utils";
import VueForm from "./components/Form.vue";
import FormColumn from "./components/FormComponents/FormColumn.vue";
import FormTabs from "./components/FormComponents/FormTabs.vue";
import FormTab from "./components/FormComponents/FormTab.vue";
import FormStatic from "./components/FormComponents/FormStatic.vue";
import FormAutocomplete from "./components/FormComponents/FormAutocomplete.vue";
import FormText from "./components/FormComponents/FormText.vue";
import FormPassword from "./components/FormComponents/FormPassword.vue";
import FormTextarea from "./components/FormComponents/FormTextarea.vue";
import FormSelect from "./components/FormComponents/FormSelect.vue";
import FormMultiSelect from "./components/FormComponents/FormMultiSelect.vue";
import FormDatePicker from "./components/FormComponents/FormDatePicker.vue";
import FormTimePicker from "./components/FormComponents/FormTimePicker.vue";
import FormCheckbox from "./components/FormComponents/FormCheckbox.vue";
import FormRadio from "./components/FormComponents/FormRadio.vue";
import FormFiles from "./components/FormComponents/Files/FormFiles.vue";
import FormWYSIWYG from "./components/FormComponents/FormWYSIWYG.vue";
import FormCode from "./components/FormComponents/FormCode.vue";

import FormFieldMixin from "./mixins/FormField";
import HasOptionsMixin from "./mixins/HasOptions";

import Collection from "./classes/collection";
import Model from "./classes/model";
import Generic from "./classes/models/generic";
import Parser from "./classes/jsonapi_parser";

import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";

export default {
  install(app: App, options: any) {

    // TODO: use options to register which components for end users to use different ones if they'd like


    app.component(VueForm.name, VueForm);
    app.component(FormColumn.name, FormColumn);
    app.component(FormTabs.name, FormTabs);
    app.component(FormTab.name, FormTab);
    app.component(FormStatic.name, FormStatic);
    app.component(FormText.name, FormText);
    app.component(FormPassword.name, FormPassword);
    app.component(FormTextarea.name, FormTextarea);
    app.component(FormSelect.name, FormSelect);
    app.component(FormMultiSelect.name, FormMultiSelect);
    app.component(FormDatePicker.name, FormDatePicker);
    app.component(FormTimePicker.name, FormTimePicker);
    app.component(FormRadio.name, FormRadio);
    app.component(FormCheckbox.name, FormCheckbox);
    app.component(FormFiles.name, FormFiles);
    app.component(FormAutocomplete.name, FormAutocomplete);
    app.component(FormWYSIWYG.name, FormWYSIWYG);
    app.component(FormCode.name, FormCode);

    // TODO: need to change this to be done more directly vs adding prototype
    // Object.prototype.getFormValueByString = byString;
    // Object.prototype.assignFormValueByString = assignOnObject;
  }
};

export {
  // Export Base Form Library
  Form,
  FormErrors,
  VueForm,
  FormFieldMixin,
  HasOptionsMixin,
  // Export Generic JSONAPI related items
  Parser,
  Collection,
  Model,
  Generic,
  // Export form fields if needing to override or register yourself
  FormColumn,
  FormTabs,
  FormTab,
  FormStatic,
  FormText,
  FormPassword,
  FormTextarea,
  FormSelect,
  FormMultiSelect,
  FormDatePicker,
  FormTimePicker,
  FormRadio,
  FormFiles,
  FormAutocomplete,
  FormCheckbox,
  FormWYSIWYG,
  FormCode,
  // export utilities
  byString,
  assignOnObject
};
