
import Vue from 'vue';
import { Form } from './Form';
import VueForm from './Form.vue';
import FormText from './FormComponents/FormText.vue';
import FormTextarea from './FormComponents/FormTextarea.vue';
import FormSelect from './FormComponents/FormSelect.vue';
import FormDatePicker from './FormComponents/FormDatePicker.vue';
import FormRadio from './FormComponents/FormRadio.vue';
import FormFiles from './FormComponents/Files/FormFiles.vue';

window.Form = Form;

Vue.component('vue-form', VueForm);

Vue.component('form-text', FormText);
Vue.component('form-textarea', FormTextarea);
Vue.component('form-select', FormSelect);
Vue.component('form-datepicker', FormDatePicker);
Vue.component('form-radio', FormRadio);
Vue.component('form-files', FormFiles);