export default class {
  constructor() {
    this.scaping = false;
    this.scraped = false;
    this.title = "";
    this.url = "";
  }

  scrape() {
    this.scaping = true;
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      this.title = tabs[0].title;
      this.url = tabs[0].url;
      this.scraped = true;
      this.scaping = false;
    });
  }

  clear() {
    this.title = "";
    this.url = "";
    this.scraped = false;
  }

  markdown() {
    return `[${this.title}](${this.url})`;
  }

  html() {
    return `
      <div class="coto">
        <a href="${this.url}" target="_blank">${this.title}</a>
      </div>
    `;
  }
}