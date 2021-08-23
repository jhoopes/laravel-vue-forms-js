import ApiError from "./ApiError";
import Collection from "./collection";
import { ErrorMessage } from "./models/errorMessage";
import { ValidationErrorMessage } from "./models/validationErrorMessage";

interface FormErrorMessage {
  type: string;
  message: string;
}

export class FormErrors {
  public fieldErrors: Collection<ErrorMessage | ValidationErrorMessage>;
  public message: FormErrorMessage | null;

  /**
   * Create a new Errors instance.
   */
  constructor() {
    this.fieldErrors = new Collection<ErrorMessage>([], {
      model: ErrorMessage,
    });
    this.message = null;
  }

  /**
   * Determine if an errors exists for the given field.
   *
   * @param {string} field
   */
  has(field: string): boolean {
    return this.fieldErrors.filter({ fieldName: field }).length > 0;
  }

  /**
   * Determine if we have any errors.
   */
  any(): boolean {
    return this.fieldErrors.length > 0;
  }

  /**
   * Retrieve the error message for a field.
   *
   * @param {string} field
   * @param {boolean} first
   */
  get(field: string, first = true): string | string[] {
    if (this.has(field)) {
      const error = this.fieldErrors
        .filter({ fieldName: field })
        .first() as ValidationErrorMessage;
      if (!error) {
        return "";
      }

      if (first) {
        return error.errorMessage[0];
      }

      return error.errorMessage;
    }

    return "";
  }

  hasGeneralMessage(): boolean {
    return this.message !== null;
  }

  getGeneralMessageType() {
    if (this.message === null) {
      return null;
    }
    return this.message.type;
  }

  getGeneralMessage() {
    if (this.message == null) {
      return null;
    }
    return this.message.message;
  }

  /**
   * Manually record the new errors.
   *
   * @param {object} errors
   */
  setErrors(errors: Collection<ErrorMessage | ValidationErrorMessage>) {
    this.fieldErrors = errors;
  }

  report(error: ApiError) {
    if (error.response.status === 422) {
      this.fieldErrors = error.errorMessages;
      this.message = {
        message: error.toString(),
        type: "error",
      };
    } else if (error.response.status === 403) {
      this.message = {
        message: "This action is unauthorized",
        type: "error",
      };
    }

    console.log("TODO: Need to finish setting errors based on type", error);

    // handle general error
  }

  /**
   * Clear one or all error fields.
   *
   * @param {string|null} field
   */
  clear(field: string | null) {
    if (field) {
      const error = this.fieldErrors.filter({ fieldName: field }).first();
      if (error) {
        this.fieldErrors.remove(error);
      }
      return;
    }

    this.fieldErrors = new Collection<ErrorMessage>([], {
      model: ErrorMessage,
    });
    this.message = null;
  }
}
