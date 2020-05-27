import Model from './model';
import moment from 'moment';

class FormConfiguration extends Model {


    defaults() {
        return {
            id: null,
            name: null,
            type: null,
            active: null,
            entity_name: null,
            entity_model: null,
            options: {},
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

export default FormConfiguration;
