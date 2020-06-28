
import { Form } from './Form';
import { FormErrors } from "./FormErrors";
import { byString, assignOnObject } from "./utilities/utils";
import VueForm from './Form.vue';
import FormColumn from './FormComponents/FormColumn.vue';
import FormTabs from './FormComponents/FormTabs.vue';
import FormTab from './FormComponents/FormTab.vue';
import FormStatic from './FormComponents/FormStatic.vue';
import FormAutocomplete from './FormComponents/FormAutocomplete.vue';
import FormText from './FormComponents/FormText.vue';
import FormPassword from "./FormComponents/FormPassword";
import FormTextarea from './FormComponents/FormTextarea.vue';
import FormSelect from './FormComponents/FormSelect.vue';
import FormDatePicker from './FormComponents/FormDatePicker.vue';
import FormTimePicker from './FormComponents/FormTimePicker.vue';
import FormCheckbox from './FormComponents/FormCheckbox.vue';
import FormRadio from './FormComponents/FormRadio.vue';
import FormFiles from './FormComponents/Files/FormFiles.vue';
import FormWYSIWYG from './FormComponents/FormWYSIWYG.vue';
import FormCode from './FormComponents/FormCode.vue';

import FormFieldMixin from './mixins/FormField';
import HasOptionsMixin from './mixins/HasOptions';

import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

export default {

    install(Vue, options) {

        Vue.component(VueForm.name, VueForm);
        Vue.component(FormColumn.name, FormColumn);
        Vue.component(FormTabs.name, FormTabs);
        Vue.component(FormTab.name, FormTab);
        Vue.component(FormStatic.name, FormStatic);
        Vue.component(FormText.name, FormText);
        Vue.component(FormPassword.name, FormPassword);
        Vue.component(FormTextarea.name, FormTextarea);
        Vue.component(FormSelect.name, FormSelect);
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

}

export { Form, FormErrors, VueForm, FormFieldMixin, HasOptionsMixin, FormColumn, FormTabs, FormTab, FormStatic, FormText, FormPassword, FormTextarea, FormSelect, FormDatePicker, FormTimePicker, FormRadio, FormFiles, FormAutocomplete, FormCheckbox, FormWYSIWYG, FormCode }
