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

// Drag and Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void
  dragLeaveHandler(event: DragEvent): void
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
    const newProject = new Project(
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

// Class to instantiate some constants and method
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    protected templateID: string,
    protected hostID: string,
    protected insertPositions: boolean,
    protected classType?: string,
  ) {
    this.templateElement = document.getElementById(templateID)! as HTMLTemplateElement
    this.hostElement = document.getElementById(hostID)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild! as U;
    if (classType) {
      this.element.id = classType;
   }
    this.renderTemplate(insertPositions);
  }

  protected renderTemplate(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : "beforeend", this.element);
  }

  abstract configure(): void
  abstract renderContent(): void
}

// Rendering List Items
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {  
  private projects: Project;

  get personNumber() {
    if (this.projects.people === 1) {
      return '1 person';
    }

    return `${this.projects.people} persons`
  }

  constructor(hostID: string, project: Project) {
    super('single-project', hostID, false ,project.id);
    this.projects = project;
    
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('plain/text', this.projects.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEndHandler(_: DragEvent) {
    console.log('Drag End Event')
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.projects.title; 
    this.element.querySelector('h3')!.textContent = this.personNumber + ' assigned'; 
    this.element.querySelector('p')!.textContent = this.projects.description; 
    console.log(this.projects)
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
}
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignProjects: Project[];

  constructor(private type: "active" | "finished") {
    super('project-list', 'app', false, `${ type}-projects`);
    this.assignProjects = [];
    
    this.configure();
    this.renderContent();
  }

  @Autobind  
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer!.types[0] === 'plain/text') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  @Autobind
  dropHandler(event: DragEvent) {
    console.log('drop', event)
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projState.addListeners((project: Project[]) => {
      const filteredProjects = project.filter((prjs) => {
        if (this.type === "active") {
          return prjs.status === ProjectStatus.Active;
        }
        prjs.status === ProjectStatus.Finished;
      });
      this.assignProjects = filteredProjects;
      this.renderList();
    });
  }


  renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " " + "PROJECTS";
  }

  private renderList() {
    const ulListEelemt = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    ulListEelemt.textContent = "";
    for (const prjList of this.assignProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjList);
    }
  }
}

class ProjectInput extends Component<HTMLFormElement, HTMLDivElement> {
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

const projectOne = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
