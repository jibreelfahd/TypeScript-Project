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

interface ValidatorConfig {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// validate user input
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

enum ProjectStatus {
  Active,
  Finished,
}

// Project - handling type and also Project creation
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type Listeners = (items: Project[]) => void;
class ProjectState {
  private listeners: Listeners[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;
  constructor() {}

  // this signifies a singleton class with a static method which is called when the getInstance is instantiated and hence
  // the class is also instatiated
  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addListeners(listenerFn: Listeners) {
    this.listeners.push(listenerFn);
  }

  getProjects(title: string, description: string, numOfPeople: number) {
    const newProject  = new Project(
      Math.random.toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);

    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projState = ProjectState.getInstance();

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.assignProjects = [];
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild! as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projState.addListeners((project: Project[]) => {
      this.assignProjects = project;
      this.renderList();
    });

    this.renderTemplate();
    this.renderContent();
  }

  private renderList() {
    const ulListEelemt = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    for (const prjList of this.assignProjects) {
      const listElement = document.createElement("li");
      listElement.textContent = prjList.title;
      ulListEelemt.appendChild(listElement);
    }
  }

  private renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " " + "PROJECTS";
  }

  private renderTemplate() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
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

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private renderTemplate() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectOne = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
