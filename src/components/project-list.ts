import Component from "../states/project-compnent.js";
import { DragTarget } from "../constants/drag-and-drop-interface.js";
import Project from "../constants/project-model.js";
import Autobind from "../decorators/autobind.js";
import { ProjectState } from "../states/project-state.js";
import { ProjectStatus } from "../constants/project-status.js";
import { ProjectItem } from "./project-item.js";

const projState = ProjectState.getInstance();

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignProjects: Project[];

  constructor(private type: "active" | "finished") {
    super('project-list', 'app', false, `${ type}-projects`);
    this.assignProjects = [];
    
    this.configure();
    this.renderContent();
  }

  @Autobind  
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer!.types[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    const prjID = event.dataTransfer!.getData('text/plain');
    projState.moveProject(prjID, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projState.addListeners((project: Project[]) => {
      const filteredProjects = project.filter((prjs) => {
        if (this.type === "active") {
          return prjs.status === ProjectStatus.Active;
        } else {
          return prjs.status === ProjectStatus.Finished;
        }
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