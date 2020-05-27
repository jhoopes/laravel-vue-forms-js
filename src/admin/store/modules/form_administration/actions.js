import axios from 'axios';
import Parser from './../../../classes/jsonapi_parser';

let apiPrefix = window.formAdmin.apiPrefix;
let adminApiPrefix = window.formAdmin.adminApiPrefix;


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


            if(context.state.useJsonApi) {
                context.commit('setFormConfiguration', Parser.parseJSONAPIResponse(response.data))
            } else {
                context.commit('setFormConfiguration', response.data);
            }

            resolve(response.data);
        }).catch(error => {
            console.error(error)
            reject(error);
        });
    })
}
