import jQuery from 'jquery';
import { Form } from './Form';
import { byString} from "./utilities/utils";
import VueForm from './Form.vue';
import FormAutocomplete from './FormComponents/FormAutocomplete.vue';
import FormText from './FormComponents/FormText.vue';
import FormTextarea from './FormComponents/FormTextarea.vue';
import FormSelect from './FormComponents/FormSelect.vue';
import FormDateTimePicker from './FormComponents/FormDateTimePicker.vue';
import FormDatePicker from './FormComponents/FormDatePicker.vue';
import FormRadio from './FormComponents/FormRadio.vue';
import FormFiles from './FormComponents/Files/FormFiles.vue';

import FormFieldMixin from './mixins/FormField';
import HasOptionsMixin from './mixins/HasOptions';


export default {

    install(Vue, options) {

        Vue.component(VueForm.name, VueForm);
        Vue.component(FormText.name, FormText);
        Vue.component(FormTextarea.name, FormTextarea);
        Vue.component(FormSelect.name, FormSelect);
        Vue.component(FormDateTimePicker.name, FormDateTimePicker);
        Vue.component(FormDatePicker.name, FormDatePicker);
        Vue.component(FormRadio.name, FormRadio);
        Vue.component(FormFiles.name, FormFiles);
        Vue.component(FormAutocomplete.name, FormAutocomplete);

        // if (window.$ === undefined || window.jQuery === undefined) {
        //     window.$ = window.jQuery = jQuery;
        // }
        // require('tempusdominus-bootstrap-3');


        Object.getFormValueByString = byString
    }

}

export { Form, VueForm, FormFieldMixin, HasOptionsMixin, FormText, FormTextarea, FormSelect, FormDateTimePicker, FormDatePicker, FormRadio, FormFiles, FormAutocomplete }
