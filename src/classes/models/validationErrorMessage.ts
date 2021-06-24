import Model from "./../model";

export class ValidationErrorMessage extends Model {
    public fieldName = "";
    public errorMessage: string[] = [];

    constructor(attributes: Record<string, any>) {
        super(attributes);

        this.id = Number(this.getUid());
        this.assign(attributes);
        this.ensureAttributesAreRegistered(
            this.removeParentPropertyNames(Object.getOwnPropertyNames(this))
        );
    }
}
