import FormAdminHome from './../components/router-views/FormAdminHome';
import FormConfiguration from './../components/router-views/FormConfiguration';
import FormConfigurationForm from './../components/router-views/FormConfigurationForm';

export default {

    generate() {

        let adminPrefix = window.formAdmin.webAdminPrefix;

        return [{
            path: adminPrefix + '/',
            component: FormAdminHome,
            name: 'formAdmin.home'
        }, {
            path: adminPrefix + '/form_configurations',
            component: FormConfiguration,
            meta: {
                title: 'Form Configuration Form'
            },
            children: [
                {
                    path: 'create',
                    component: FormConfigurationForm,
                    name: 'formAdmin.form_configurations.create',
                    props: (route) => {
                        return {
                            id: null
                        }
                    },
                    meta: {
                        title: 'Create Form Configuration'
                    }
                },
                {
                    path: ':id',
                    component: FormConfigurationForm,
                    name: 'formAdmin.form_configurations.edit',
                    props: (route) => {
                        return {
                            id: parseInt(route.params.id)
                        }
                    },
                    meta: {
                        title: 'Update Form Configuration'
                    }
                }
            ]
        }]

    }

}
