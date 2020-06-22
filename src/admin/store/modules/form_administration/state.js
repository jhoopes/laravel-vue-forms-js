import Collection from './../../../classes/collection';
import FormConfiguration from './../../../classes/models/formConfiguration';

export default {

    useJsonApi: false,
    mainView: 'form-admin-search',

    form_configurations: new Collection([], {
        model: FormConfiguration
    }),

    standardValidationRules: [],

}
