import { Collection } from "./collection";
import { ErrorMessage } from "./models/errorMessage";
import { ValidationErrorMessage } from "./models/validationErrorMessage";
import { IJSONAPIResponse } from "./../types/index";

const parseValidationErrors = (
  responseData: Record<string, any> | string
): Collection<ValidationErrorMessage> => {
  const validationErrors = new Collection([], {
    model: ValidationErrorMessage,
  });

  if (typeof responseData === "string") {
    validationErrors.add(new ErrorMessage({ message: responseData }));
    return validationErrors;
  }

  // check if JSON API Error response as array
  if (Array.isArray(responseData.errors)) {
    // TODO
  } else {
    // parse laravel validation errors

    for (const fieldName in responseData.errors) {
      if (Object.hasOwnProperty.call(responseData.errors, fieldName)) {
        validationErrors.add(
          new ValidationErrorMessage({
            fieldName,
            errorMessage: responseData.errors[fieldName],
          })
        );
      }
    }
  }

  return validationErrors;
};

export default class ApiError extends Error {
  response: Response;
  responseData: IJSONAPIResponse;
  errorMessages: Collection<ErrorMessage | ValidationErrorMessage>;

  constructor(response: Response, responseData: IJSONAPIResponse) {
    super();
    this.response = response;

    this.errorMessages = new Collection([], {
      model: ErrorMessage,
    });
    this.responseData = responseData;
    if (!responseData.errors) {
      console.error("Invalid JSONAPI Response", responseData);
      return;
    }

    if (response.status === 422) {
      this.errorMessages = parseValidationErrors(responseData);
      return;
    }

    if (Array.isArray(responseData.errors)) {
      responseData.errors.forEach((errorMessage) => {
        this.errorMessages.add(new ErrorMessage(errorMessage));
      });
    } else {
      this.errorMessages.add(new ErrorMessage(responseData.errors));
    }
  }

  toString(): string {
    switch (this.response.status) {
      case 422:
        return "The document was well-formed but contains semantic errors.";
      default:
        return "There was an issue with making the API request.  Please check errors.";
    }
  }
}
