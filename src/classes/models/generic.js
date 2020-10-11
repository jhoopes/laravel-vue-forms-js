import Model from "@/classes/model";

class Generic extends Model {
    defaults() {
        return {
            id: null,
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
}

export default Generic;
