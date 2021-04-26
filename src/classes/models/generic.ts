import Model from "./../model";
import {DateTime} from "luxon";

export class Generic extends Model {
    public id: number = 0;
    public created_at: DateTime = DateTime.now()
    public updated_at: DateTime = DateTime.now()

    casts() {
        return {
            created_at: this.parseDate,
            updated_at: this.parseDate
        };
    }
}

export default Generic;
