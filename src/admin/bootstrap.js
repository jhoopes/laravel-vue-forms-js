import Vue from "vue";

import draggable from "vuedraggable";
import Modal from "@/admin/components/Modal";

import HomeFormConfigurationRow from "@/admin/components/grid-rows/HomeFormConfigurationRow";

import FormConfigurationFormField from "@/admin/components/FormConfigurationFormField";
import NestedFormFieldList from "@/admin/components/NestedFormFieldList";
import FieldExtra from "@/admin/components/CustomWidgets/FieldExtra";
import FieldExtraValidationRules from "@/admin/components/CustomWidgets/FormValidation";

Vue.component("lvf-modal", Modal);
Vue.component("home-form-configuration-row", HomeFormConfigurationRow);

Vue.component("draggable", draggable);
Vue.component("form-configuration-form-field", FormConfigurationFormField);
Vue.component("nested-form-field-list", NestedFormFieldList);
Vue.component("field-extra", FieldExtra);
Vue.component("field-extra-validation-rules", FieldExtraValidationRules);
