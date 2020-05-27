import Model from './model';
import moment from "moment";

class FormField extends Model {


    defaults() {
        return {
            id: null,
            name: null,
            value_field: null,
            label: null,
            widget: null,
            visible: 1,
            disabled: 0,
            is_eav: 0,
            parent_id: null,
            cast_to: null,
            field_extra: {},
            created_at: moment.now(),
            updated_at: moment.now()
        }
    }

    casts() {
        return {
            created_at: this.parseDate,
            updated_at: this.parseDate
        }
    }

}

export default FormField;
