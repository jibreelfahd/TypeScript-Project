import ValidatorConfig from "../constants/validator-config";

export default function validate(validators: ValidatorConfig) {
  let isValid = true;

  if (validators.required) {
    isValid = isValid && validators.value.toString().trim().length !== 0;
  }

  if (validators.minLength != null && typeof validators.value === "string") {
    isValid = isValid && validators.value.length > validators.minLength;
  }

  if (validators.maxLength != null && typeof validators.value === "string") {
    isValid = isValid && validators.value.length < validators.maxLength;
  }

  if (validators.min != null && typeof validators.value === "number") {
    isValid = isValid && validators.value > validators.min;
  }

  if (validators.max != null && typeof validators.value === "number") {
    isValid = isValid && validators.value < validators.max;
  }

  return isValid;
}