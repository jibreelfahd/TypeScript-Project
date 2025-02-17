function Autobind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalDescriptor = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalDescriptor.bind(this);
      return boundFn;
    },
  };
  return newDescriptor;
}

// validate user input
interface ValidatorConfig {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validators: ValidatorConfig) {
  let isValid = true;

  if (validators.required) {
    isValid = validators.value.toString().trim().length !== 0;
  }

  if (validators.minLength != null && typeof validators.value === "string") {
    isValid = validators.value.length < validators.minLength;
  }

  if (validators.maxLength != null && typeof validators.value === "string") {
    isValid = validators.value.length < validators.maxLength;
  }

  if (validators.min != null && typeof validators.value === "number") {
    isValid = validators.value > validators.min;
  }

  if (validators.max != null && typeof validators.value === "number") {
    isValid = validators.value < validators.max;
  }

  return isValid;
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  title: string;
  description: string;
  people: number;

  constructor(t: string, desc: string, p: number) {
    this.title = t;
    this.description = desc;
    this.people = p;

    this.templateElement = document.querySelector('.project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true)

    this.element = importedNode.firstElementChild! as HTMLElement;
  }

  renderTemplate() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
    this.renderTemplate();
  }

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    const titleValidatable: ValidatorConfig = {
      value: title,
      required: true,
      minLength: 2,
      maxLength: 15,
    };

    const descValidatable: ValidatorConfig = {
      value: description,
      required: true,
      minLength: 2,
      maxLength: 15,
    };

    const peopleValidatable: ValidatorConfig = {
      value: +people,
      required: true,
      min: 1,
      max: 10,
    };

    if (
      validate(titleValidatable) &&
      validate(descValidatable) &&
      validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again later!");
      const prjList = new ProjectList(title, description, +people);
      console.log(prjList);
      return;
    } else {
      return [title, description, +people];
    }
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.getUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      this.clearInput();
      console.log(title, description, people);
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private renderTemplate() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectOne = new ProjectInput();
