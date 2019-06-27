
import { Form } from './Form';
import { byString, assignOnObject } from "./utilities/utils";
import VueForm from './Form.vue';
import FormColumn from './FormComponents/FormColumn.vue';
import FormAutocomplete from './FormComponents/FormAutocomplete.vue';
import FormText from './FormComponents/FormText.vue';
import FormTextarea from './FormComponents/FormTextarea.vue';
import FormSelect from './FormComponents/FormSelect.vue';
import FormDatePicker from './FormComponents/FormDatePicker.vue';
import FormTimePicker from './FormComponents/FormTimePicker.vue';
import FormCheckbox from './FormComponents/FormCheckbox.vue';
import FormRadio from './FormComponents/FormRadio.vue';
import FormFiles from './FormComponents/Files/FormFiles.vue';
import FormWYSIWYG from './FormComponents/FormWYSIWYG.vue';

import FormFieldMixin from './mixins/FormField';
import HasOptionsMixin from './mixins/HasOptions';

import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

export default {

    install(Vue, options) {

        Vue.component(VueForm.name, VueForm);
        Vue.component(FormColumn.name, FormColumn);
        Vue.component(FormText.name, FormText);
        Vue.component(FormTextarea.name, FormTextarea);
        Vue.component(FormSelect.name, FormSelect);
        Vue.component(FormDatePicker.name, FormDatePicker);
        Vue.component(FormTimePicker.name, FormTimePicker);
        Vue.component(FormRadio.name, FormRadio);
        Vue.component(FormCheckbox.name, FormCheckbox);
        Vue.component(FormFiles.name, FormFiles);
        Vue.component(FormAutocomplete.name, FormAutocomplete);
        Vue.component(FormWYSIWYG.name, FormWYSIWYG);


        Object.getFormValueByString = byString;
        Object.assignFormValueByString = assignOnObject;
    }

}

export { Form, VueForm, FormFieldMixin, HasOptionsMixin, FormColumn, FormText, FormTextarea, FormSelect, FormDatePicker, FormTimePicker, FormRadio, FormFiles, FormAutocomplete, FormCheckbox, FormWYSIWYG }
