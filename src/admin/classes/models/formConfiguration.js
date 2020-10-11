import uniqueId from "lodash/uniqueId";
import Model from "@/classes/model";
import FormField from "@/admin/classes/models/formField";

class FormConfiguration extends Model {
    defaults() {
        return {
            id: uniqueId("formConfiguration-"),
            name: null,
            type: null,
            active: null,
            entity_name: null,
            entity_model: null,
            options: {},
            created_at: Date.now(),
            updated_at: Date.now()
        };
    }

    casts() {
        return {
            created_at: this.parseDate,
            updated_at: this.parseDate
        };
    }

    relationships() {
        return {
            fields: FormField
        };
    }
}

export default FormConfiguration;
