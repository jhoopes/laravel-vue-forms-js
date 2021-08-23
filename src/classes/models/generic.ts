import Model from "./../model";

export class Generic extends Model {
  public id = 0;

  constructor(attributes: Record<string, any>) {
    super(attributes);

    this.assign(attributes);
    this.ensureAttributesAreRegistered(
      this.removeParentPropertyNames(Object.getOwnPropertyNames(this))
    );
  }

  casts(): Record<string, any> {
    return {
      created_at: this.parseDate,
      updated_at: this.parseDate,
    };
  }
}

export default Generic;
