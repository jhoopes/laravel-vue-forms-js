import axios from 'axios';

let apiPrefix = window.formAdmin.apiPrefix;
let adminApiPrefix = window.formAdmin.adminApiPrefix;


export const getFormConfigurationByName = (context, formConfigName) => {

    return new Promise((resolve, reject) => {

        axios.get(apiPrefix + '/configuration', {
            params: {
                formConfigName
            }
        }).then(response => {

            if(response.status !== 200) {
                console.error(response);
                return;
            }

            context.commit('setFormConfiguration', response.data);
            resolve(response.data);
        }).catch(error => {
            console.error(error)
            reject(error);
        });
    })
}
