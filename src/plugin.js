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
import FormPassword from "./components/FormComponents/FormPassword";
import FormTextarea from "./components/FormComponents/FormTextarea.vue";
import FormSelect from "./components/FormComponents/FormSelect.vue";
import FormMultiSelect from "./components/FormComponents/FormMultiSelect";
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
    install(Vue) {
        Vue.component(VueForm.name, VueForm);
        Vue.component(FormColumn.name, FormColumn);
        Vue.component(FormTabs.name, FormTabs);
        Vue.component(FormTab.name, FormTab);
        Vue.component(FormStatic.name, FormStatic);
        Vue.component(FormText.name, FormText);
        Vue.component(FormPassword.name, FormPassword);
        Vue.component(FormTextarea.name, FormTextarea);
        Vue.component(FormSelect.name, FormSelect);
        Vue.component(FormMultiSelect.name, FormMultiSelect);
        Vue.component(FormDatePicker.name, FormDatePicker);
        Vue.component(FormTimePicker.name, FormTimePicker);
        Vue.component(FormRadio.name, FormRadio);
        Vue.component(FormCheckbox.name, FormCheckbox);
        Vue.component(FormFiles.name, FormFiles);
        Vue.component(FormAutocomplete.name, FormAutocomplete);
        Vue.component(FormWYSIWYG.name, FormWYSIWYG);
        Vue.component(FormCode.name, FormCode);

        Object.getFormValueByString = byString;
        Object.assignFormValueByString = assignOnObject;
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
