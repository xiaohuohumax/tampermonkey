import Swal from 'sweetalert2';
import { GM_registerMenuCommand } from '$';

// 代码参考：https://greasyfork.org/zh-CN/scripts/478174/code

interface AdBlockerOptions {
  allowRenderMessage: boolean
}

class AdBlocker {

  private blockCount: number = 0;
  private messageDiv: HTMLDivElement = null!;
  private keywords: string[] = [];
  private keywordSaveKey = 'bili-t-space-adblock-keywords';
  private emptyKeywordMessage = '这里啥也没有哦，快去添加吧~~~';

  constructor(private options: AdBlockerOptions) {
    this.loadKeyword();
    this.renderMessageBar();
    this.addMenuCommand();
  }

  private loadKeyword() {
    const keywordList = localStorage.getItem(this.keywordSaveKey) || '';
    this.keywords = keywordList.split(',').filter(k => k !== '');
  }

  private addKeyword = (keyword: string) => {
    if (this.keywords.includes(keyword)) {
      return;
    }
    this.keywords.push(keyword);
    localStorage.setItem(this.keywordSaveKey, this.keywords.join(','));
    this.showMessage(`已添加关键字：${keyword}`);
  };

  private clearAllKeyword = () => {
    this.keywords = [];
    localStorage.setItem(this.keywordSaveKey, '');
    this.showMessage('已清空全部过滤关键字');
  };

  private removeKeyword = (keyword: string) => {
    this.keywords = this.keywords.filter(k => k !== keyword);
    localStorage.setItem(this.keywordSaveKey, this.keywords.join(','));
    this.showMessage(`已删除关键字：${keyword}`);
  };

  private renderMessageBar() {
    if (!this.options.allowRenderMessage) {
      return;
    }
    this.messageDiv = document.createElement('div');
    this.messageDiv.style.position = 'fixed';
    this.messageDiv.style.bottom = '10px';
    this.messageDiv.style.right = '10px';
    this.messageDiv.style.fontSize = '10px';
    this.messageDiv.style.color = '#789';
    this.messageDiv.style.zIndex = '9999';
    this.messageDiv.addEventListener('mouseover', () => {
      this.messageDiv.style.color = '#234';
    });
    this.messageDiv.addEventListener('mouseout', () => {
      this.messageDiv.style.color = '#789';
    });
    this.messageDiv.style.cursor = 'pointer';

    document.body.appendChild(this.messageDiv);

    this.messageDiv.addEventListener('click', this.renderAddKeywordBar);
  }

  private addMenuCommand = () => {
    GM_registerMenuCommand('添加过滤关键字', this.renderAddKeywordBar);
    GM_registerMenuCommand('管理过滤关键字', this.renderManagerKeywordBar);
  };

  private renderAddKeywordBar = async () => {
    const { isConfirmed, value } = await Swal.fire({
      title: '请输入要过滤的关键字',
      input: 'text',
      inputPlaceholder: '多个关键字请用英文逗号分隔',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '添加',
      cancelButtonText: '取消',
      preConfirm: async (keyword: string) => {
        const ks = keyword.split(',').map(k => k.trim()).filter(k => k !== '');
        if (ks.length === 0) {
          Swal.showValidationMessage('关键字不能为空');
          return;
        }
        return ks;
      }
    });
    if (!isConfirmed) {
      return;
    }
    (value as string[]).forEach(this.addKeyword);
  };

  private renderManagerKeywordBar = async () => {
    const managerDiv = document.createElement('div');
    managerDiv.style.maxHeight = '300px';
    managerDiv.style.overflowY = 'auto';
    managerDiv.style.color = 'rgba(0, 0, 0, .64)';
    managerDiv.style.fontSize = '14px';

    const keywordDivList = this.keywords.map((keyword, index) => {
      return `<div style="text-align: left; margin: 5px 0;">
        <span>${index + 1}</span>
        <button data-keyword="${keyword}" class="swal2-confirm swal2-styled swal2-default-outline" style="padding: 2px 10px; margin:0 10px;">
          删除
        </button>
        <span>${keyword}</span>
      </div>`;
    });

    managerDiv.innerHTML = keywordDivList.length > 0 ? keywordDivList.join('') : this.emptyKeywordMessage;

    managerDiv.addEventListener('click', e => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'BUTTON') {
        const keyword = e.target.dataset.keyword;

        keyword && this.removeKeyword(keyword);
        e.target.parentElement?.remove();

        if (this.keywords.length === 0) {
          managerDiv.innerHTML = this.emptyKeywordMessage;
        }
      }
    });

    const { isConfirmed } = await Swal.fire({
      title: '管理过滤关键字',
      html: managerDiv,
      showCancelButton: true,
      confirmButtonText: '清空全部',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
    });

    if (!isConfirmed) {
      return;
    }
    this.clearAllKeyword();
  };

  private showMessage(message: string) {
    this.messageDiv.innerText = message;
    console.log(message);
  }

  public run() {
    const observer = new MutationObserver(() => {
      const cards = Array.from(document.querySelectorAll<HTMLDivElement>('.bili-dyn-list__item'));
      const adCards = cards.filter(card => {

        const text = card.innerText || card.textContent || '';
        const hasKeyword = this.keywords.some(keyword => text.includes(keyword));
        if (hasKeyword) {
          return true;
        }

        const contexts = Array.from(card.querySelectorAll<HTMLDivElement>('.bili-rich-text__content'));
        return contexts.some(c => {
          const hasGoodsSpan = c.querySelector('span[data-type="goods"]');
          const hasLotterySpan = c.querySelector('span[data-type="lottery"]');
          const hasVoteSpan = c.querySelector('span[data-type="vote"]');
          return hasGoodsSpan || hasLotterySpan || hasVoteSpan;
        });
      });

      adCards.forEach(card => {
        card.remove();
        this.blockCount++;
        if (this.options.allowRenderMessage) {
          this.showMessage(`已拦截 ${this.blockCount} 条广告`);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

const adBlocker = new AdBlocker({
  allowRenderMessage: true
});

adBlocker.run();