export default class Message {
  private messageDiv: HTMLDivElement = document.createElement('div');
  private color: string = document.documentElement.style.color;
  private opacity: string = '.8';
  private name: string = 'Bili Dynamic Adblock';

  constructor() {
    const style: Partial<CSSStyleDeclaration> = {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      fontSize: '10px',
      color: this.color,
      zIndex: '9999',
      opacity: this.opacity,
      cursor: 'pointer',
      userSelect: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '2px 4px',
      borderRadius: '4px',
    };

    Object.assign(this.messageDiv.style, style);

    this.messageDiv.innerText = this.name;
    this.messageDiv.addEventListener('mouseover', () => this.messageDiv.style.opacity = '1');
    this.messageDiv.addEventListener('mouseout', () => this.messageDiv.style.opacity = this.opacity);

    document.body.appendChild(this.messageDiv);
  }

  public addClickEventListener(clickHandler: () => void) {
    this.messageDiv.addEventListener('click', clickHandler);
  }

  public showMessage(message: string) {
    this.messageDiv.innerText = message;
    console.log(message);
  }
}