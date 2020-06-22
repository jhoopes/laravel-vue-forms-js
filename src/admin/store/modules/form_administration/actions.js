import axios from 'axios';
import Parser from './../../../classes/jsonapi_parser';
import FormConfiguration from './../../../classes/models/formConfiguration';

let apiPrefix = window.formAdmin.apiPrefix;
let adminApiPrefix = window.formAdmin.apiAdminPrefix;


export const getFormConfigurationByName = (context, {formConfigName, formConfigType}) => {

    var params = {};

    if(formConfigName) {
        params.formConfigName = formConfigName;
    }

    if(formConfigType) {
        params.formConfigType = formConfigType;
    }

    return new Promise((resolve, reject) => {

        axios.get(apiPrefix + '/configuration', {
            params
        }).then(response => {

            if(response.status !== 200) {
                console.error(response);
                return;
            }

            var formConfig;
            if(context.state.useJsonApi) {
                formConfig = Parser.parseJSONAPIResponse(response.data);
                context.commit('setOrUpdateFormConfiguration', formConfig)
            } else {
                formConfig = new FormConfiguration(response.data);
                context.commit('setOrUpdateFormConfiguration', formConfig);
            }

            resolve(response.data);
        }).catch(error => {
            console.error(error)
            reject(error);
        });
    })
}

export const getFormConfigurationById = (context, {formConfigId, include}) => {

    return new Promise((resolve, reject) => {

        var params = {};
        if(include && Array.isArray(include)) {
            params.include = include;
        }

        axios.get(apiPrefix + '/configuration/' + formConfigId, {
            params
        }).then(response => {
            var formConfig;
            if(context.state.useJsonApi) {
                formConfig = Parser.parseJSONAPIResponse(response.data);
                context.commit('setOrUpdateFormConfiguration', formConfig)
            } else {
                formConfig = response.data;
                context.commit('setOrUpdateFormConfiguration', formConfig);
            }

            resolve(response.data);
        }).catch(error => {
            console.error(error);
            reject(error);
        })
    })
}

export const getStandardValidationRules = context => {

    return new Promise((resolve, reject) => {
        axios.get(adminApiPrefix + '/validation_rules').then(response => {
            var rules;
            if(context.state.useJsonApi) {
                rules = Parser.parseJSONAPIResponse(response.data);
            }else {
                rules = response.data;
            }
            context.commit('setStandardValidationRules', rules);
            resolve(rules);
        }).catch(error => {
            console.error(error);
            reject(error);
        });
    });

}
