import Model from "./../model";

export class ErrorMessage extends Model {
    public id: number;
    public status: string | null;
    public title: string | null;
    public detail: string | null;
    public meta: [];
    public source: Record<string, any>;

    constructor(
        attributes: Record<string, any>,
        options?: Record<string, any>
    ) {
        super(attributes, options);
        this.id = 0;
        this.status = null;
        this.title = null;
        this.detail = null;
        this.meta = [];
        this.source = {};
    }
}
