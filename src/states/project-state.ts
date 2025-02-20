import Project from "../constants/project-model.js";
import { ProjectStatus } from "../constants/project-status.js";

type Listeners = (items: Project[]) => void;
export class ProjectState {
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
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectID: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectID);
    
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners () {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}