import Vue from 'vue';
import FormField from './../../../classes/models/formField';

export const setUseJsonApi = (state, useJsonApi) => {
    state.useJsonApi = useJsonApi;
}

export const setOrUpdateFormConfiguration = (state, formConfig) => {

    let existingFormConfig = state.form_configurations.filter({id :formConfig.id}).first();

    if(existingFormConfig) {
        existingFormConfig.assign(formConfig);
        return;
    }

    state.form_configurations.add(formConfig);
}

export const addNewFieldToFormConfig = (state, formConfigId) => {

    let formConfiguration = state.form_configurations.filter({id: formConfigId}).first();

    if(!formConfiguration) {
        console.error('invalid form configuration id', formConfigId);
    }

    formConfiguration.ensureRelationshipIsSet('fields');


    formConfiguration.fields.add(new FormField({}));
}

export const setStandardValidationRules = (state, rules) => {

    state.standardValidationRules = rules;
}
