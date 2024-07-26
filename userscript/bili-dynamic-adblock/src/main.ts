import { GM_registerMenuCommand } from '$';
import swal from 'sweetalert';
import Message from './message';
import Store from './store';

// 代码参考：https://greasyfork.org/zh-CN/scripts/478174/code

class AdBlocker {

  private blockCount: number = 0;
  private emptyKeywordMessage = '这里啥也没有哦，快去添加吧~~~';

  constructor(private store: Store, private message: Message) {
    this.addMenuCommand();
  }

  private addMenuCommand = () => {
    GM_registerMenuCommand('添加过滤关键字', this.renderAddKeywordBar);
    GM_registerMenuCommand('管理过滤关键字', this.renderManagerKeywordBar);
  };

  public renderAddKeywordBar = async () => {
    const id = 'bili-t-space-adblock-add-keyword-bar' + Math.random().toString(36).substr(2);
    swal({
      title: '请输入要过滤的关键字',
      content: {
        element: 'input',
        attributes: {
          id,
          placeholder: '多个关键字请用英文逗号分隔',
          style: 'color: rgba(0, 0, 0, .65);'
        }
      },
      buttons: {
        cancel: {
          text: '取消',
          value: false,
          visible: true,
        },
        confirm: {
          text: '添加',
          value: true,
          visible: true,
        }
      }
    }).then(async (status) => {
      const value = status
        ? (document.getElementById(id) as HTMLInputElement).value
        : '';
      return value.split(',').filter(k => k !== '');
    }).then(keywords => {
      for (const keyword of keywords) {
        if (this.store.addKeyword(keyword)) {
          this.message.showMessage(`已添加关键字：${keyword}`);
        }
      }
    });
  };

  public renderManagerKeywordBar = async () => {
    const managerDiv = document.createElement('div');
    managerDiv.style.maxHeight = '300px';
    managerDiv.style.overflowY = 'auto';
    managerDiv.style.color = 'rgba(0, 0, 0, .64)';
    managerDiv.style.fontSize = '14px';

    const keywords = this.store.getKeywords();

    const keywordDivList = keywords.map((keyword, index) => {
      return `<div style="text-align: left; margin: 5px 0;">
        <span style="display: inline-block; min-width:1.5em;">${index + 1}</span>
        <button data-keyword="${keyword}" class="swal-button swal-button--danger" style="padding: 2px 10px; margin:0 10px;">
          删除
        </button>
        <span>${keyword}</span>
      </div>`;
    });

    managerDiv.innerHTML = keywordDivList.length > 0 ? keywordDivList.join('') : this.emptyKeywordMessage;

    managerDiv.addEventListener('click', e => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'BUTTON') {
        const keyword = e.target.dataset.keyword;

        if (this.store.removeKeyword(keyword)) {
          this.message.showMessage(`已删除关键字：${keyword}`);
        }

        e.target.parentElement?.remove();

        if (keywords.length === 0) {
          managerDiv.innerHTML = this.emptyKeywordMessage;
        }
      }
    });

    swal({
      title: '管理过滤关键字',
      content: {
        element: managerDiv,
      },
      dangerMode: true,
      buttons: {
        confirm: {
          text: '清空',
          value: true,
          visible: true,
          closeModal: true
        }
      }
    }).then(async status => {
      return status && swal({
        title: '确认清空全部过滤关键字？',
        text: '清空后将无法恢复，确定要清空吗？',
        icon: 'warning',
        buttons: {
          cancel: {
            text: '取消',
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: '确认',
            value: true,
            visible: true,
            className: 'swal-button--danger',
            closeModal: true
          }
        }
      });
    }).then(status => {
      if (status) {
        this.store.clearAllKeywords();
        this.message.showMessage('已清空全部过滤关键字');
      }
    });
  };

  public run() {
    const observer = new MutationObserver(() => {
      const cards = Array.from(document.querySelectorAll<HTMLDivElement>('.bili-dyn-list__item'));
      const adCards = cards.filter(card => {

        const text = card.innerText || card.textContent || '';
        const hasKeyword = this.store.getKeywords().some(keyword => text.includes(keyword));
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
        this.message.showMessage(`已拦截 ${this.blockCount} 条动态`);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

const store = new Store();
const message = new Message();
const adBlocker = new AdBlocker(store, message);

message.addClickEventListener(adBlocker.renderAddKeywordBar);
store.addKeywordChangeListener(() => message.showMessage('过滤关键字已更新'));

adBlocker.run();