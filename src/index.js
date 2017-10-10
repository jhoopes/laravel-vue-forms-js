import VueM from 'vue';
import { Form } from './Form';
import VueForm from './Form.vue';
import FormText from './FormComponents/FormText.vue';
import FormTextarea from './FormComponents/FormTextarea.vue';
import FormSelect from './FormComponents/FormSelect.vue';
import FormDatePicker from './FormComponents/FormDatePicker.vue';
import FormRadio from './FormComponents/FormRadio.vue';
import FormFiles from './FormComponents/Files/FormFiles.vue';



export default {

    install(Vue, options) {

        Vue.component(VueForm.name, VueForm);
        Vue.component(FormText.name, FormText);
        Vue.component(FormTextarea.name, FormTextarea);
        Vue.component(FormSelect.name, FormSelect);
        Vue.component(FormDatePicker.name, FormDatePicker);
        Vue.component(FormRadio.name, FormRadio);
        Vue.component(FormFiles.name, FormFiles);
    }

}

export { Form, VueForm, FormText, FormTextarea, FormSelect, FormDatePicker, FormRadio, FormFiles }
