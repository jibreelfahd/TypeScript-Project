function Autobind (_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalDescriptor = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalDescriptor.bind(this);
      return boundFn;
    },
  }
  return newDescriptor;
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

  private getUserInput (): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    if (title.trim().length === 0 || description.trim().length === 0 || people.trim().length === 0) {
      alert('Invalid input, please try again later!');
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
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private renderTemplate() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectOne = new ProjectInput();
