import Vue from 'vue';

export const setUseJsonApi = (state, useJsonApi) => {
    state.useJsonApi = useJsonApi;
}

export const setFormConfiguration = (state, formConfig) => {

    state.form_configurations.push(formConfig);
}
