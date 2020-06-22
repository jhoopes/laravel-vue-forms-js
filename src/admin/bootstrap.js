import Vue from 'vue';

import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import HomeFormConfigurationRow from './components/grid-rows/HomeFormConfigurationRow';

import FieldExtra from './components/CustomWidgets/FieldExtra';
import FieldExtraValidationRules from './components/CustomWidgets/FormValidation';

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('home-form-configuration-row', HomeFormConfigurationRow);

Vue.component('field-extra', FieldExtra);
Vue.component('field-extra-validation-rules', FieldExtraValidationRules);
