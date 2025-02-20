export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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