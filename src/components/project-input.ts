import Component from "../states/project-compnent";
import ValidatorConfig from "../constants/validator-config";
import { ProjectState } from "../states/project-state";
import Autobind from "../decorators/autobind";
import validate from "../utils/validate-inputs";
const projState = ProjectState.getInstance();

export class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', false, 'user-input');
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
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  } 

  renderContent() {}

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    const titleValidatable: ValidatorConfig = {
      value: title,
      required: true,
      minLength: 2,
      maxLength: 25,
    };

    const descValidatable: ValidatorConfig = {
      value: description,
      required: true,
      minLength: 2,
      maxLength: 25,
    };

    const peopleValidatable: ValidatorConfig = {
      value: +people,
      required: true,
      min: 1,
      max: 10,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again later!");
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
      projState.getProjects(title, description, people);
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}
