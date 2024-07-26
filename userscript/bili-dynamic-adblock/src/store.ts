import { GM_addValueChangeListener, GM_getValue, GM_setValue } from '$';

export default class Store {
  private keywords: string[] = [];
  private keywordSaveKey = 'bili-t-space-adblock-keywords';
  private keywordChangeListeners: ((keywords: string[]) => void)[] = [];

  constructor() {
    this.loadKeywords();
    GM_addValueChangeListener<string[]>(this.keywordSaveKey, (_key, _oldValue, newValue, remote) => {
      if (remote) {
        this.keywords = newValue ?? [];
        this.keywordChangeListeners.forEach(listener => listener(this.keywords));
      }
    });
  }

  public addKeywordChangeListener(listener: (keywords: string[]) => void) {
    this.keywordChangeListeners.push(listener);
  }

  private loadKeywords() {
    this.keywords = GM_getValue<string[]>(this.keywordSaveKey, []);
  }

  public getKeywords() {
    return this.keywords;
  }

  public addKeyword(keyword: string): boolean {
    if (this.keywords.includes(keyword)) {
      return false;
    }
    this.keywords.push(keyword);
    GM_setValue(this.keywordSaveKey, this.keywords);
    return true;
  }

  public clearAllKeywords() {
    this.keywords = [];
    GM_setValue(this.keywordSaveKey, []);
  }

  public removeKeyword(keyword: string | undefined): boolean {
    if (!keyword) {
      return false;
    }
    const index = this.keywords.indexOf(keyword);
    if (index === -1) {
      return false;
    }
    this.keywords.splice(index, 1);
    GM_setValue(this.keywordSaveKey, this.keywords);
    return true;
  }
}