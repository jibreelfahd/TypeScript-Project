import Component from "../states/project-compnent";
import { Draggable } from "../constants/drag-and-drop-interface";
import Project from "../constants/project-model";
import Autobind from "../decorators/autobind";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {  
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
    event.dataTransfer!.setData('text/plain', this.projects.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEndHandler(_: DragEvent) {}

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.projects.title; 
    this.element.querySelector('h3')!.textContent = this.personNumber + ' assigned'; 
    this.element.querySelector('p')!.textContent = this.projects.description; 
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
}