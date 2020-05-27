import Model from './model';
import moment from "moment";

class Generic extends Model {


    defaults() {
        return {
            id: null,
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

export default Generic;
