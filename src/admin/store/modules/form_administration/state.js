import Collection from "@/classes/collection";
import FormConfiguration from "@/admin/classes/models/formConfiguration";
import Generic from "@/classes/models/generic";

export default {
    useJsonApi: false,
    mainView: "form-admin-search",

    form_configurations: new Collection([], {
        model: FormConfiguration
    }),

    formConfigFieldOrder: {},

    standardValidationRules: [],
    widgetTypes: new Collection([], {
        model: Generic
    })
};
