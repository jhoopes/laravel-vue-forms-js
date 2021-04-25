import Model from "./../model";
import {DateTime} from "luxon";

export class FormField extends Model {
    public id: number = 0
    public name: string = ''
    public value_field: string = ''
    public label: string = ''
    public widget: string = ''
    public visible: boolean = true
    public disabled: boolean = false
    public is_eav: boolean = false
    public parent_id: number | null = null
    public cast_to: string | null = null
    public field_extra: Record<string, any> = {}
    public created_at: DateTime = DateTime.now()
    public updated_at: DateTime = DateTime.now()

    public children: FormField[] = []

    constructor(attributes: Record<string, any>) {
        super(attributes);

        this.assign(attributes);
        this.ensureAttributesAreRegistered(this.removeParentPropertyNames(Object.getOwnPropertyNames(this)));
    }

    casts() {
        return {
            created_at: this.parseDate,
            updated_at: this.parseDate
        };
    }
}
