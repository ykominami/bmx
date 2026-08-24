import { Mover } from './mover.js';
import { Util } from './util.js';

/**
 * ブックマーク移動グループを管理するクラス
 * @class Movergroup
 */
export class Movergroup {
  static mover_group = null;

  /**
   * Movergroupクラスのコンストラクタ
   */
  constructor() {
    this.group = {};
    this.keys = [];
  }

  /**
   * 移動グループのシングルトンインスタンスを取得する
   * @returns {Movergroup} 移動グループのインスタンス
   */
  static get_mover_group() {
    if (this.mover_group == null) {
      this.mover_group = new Movergroup();
      this.mover_group.add('/Video', 'www.youtube.com');
      this.mover_group.add('/Video-nico', 'www.nicovideo.jp');
      this.mover_group.add('/Video-bili', 'www.bilibili.com');
      this.mover_group.add('/Amazon', 'www.amazon.co.jp');
      this.mover_group.add('/Note.com', 'note.com');
    }
    return this.mover_group;
  }

  /**
   * 移動グループに移動設定を追加する
   * @param {string} hier - 階層パス
   * @param {string} hostname - ホスト名
   */
  add(hier, hostname) {
    let mover = new Mover(hier, hostname);
    if (mover.dest_parent_item == null) {
      /* console.log(
                `Movergroup.add hier=${hier} hostname=${hostname} mover.dest_parent_item=${mover.dest_parent_item}`
            );
            */
    }
    this.group[hostname] = mover;
    this.keys = Object.keys(this.group);
  }

  /**
   * ブックマークアイテムを移動する（ホスト名に基づいて自動的に移動先を決定）
   * @param {Object} bookmarkItem - 移動するブックマークアイテム
   * @param {string} [bookmarkItem.url] - ブックマークアイテムのURL
   * @returns {boolean|Promise} 移動結果（URLがない場合はfalse）
   */
  async move(bookmarkItem) {
    let ret = false;
    // console.log(`Movergroup.move bookmarkItem.url=${bookmarkItem.url}`)
    // console.log(`Movergroup.move keys=${ Object.keys(this.group) }`)
    if (bookmarkItem.url) {
      const hostname = await Util.parseURLX(bookmarkItem.url);
      // console.log(`Movergroup.move || hostname=${hostname}`)
      if (this.keys.includes(hostname)) {
        // console.log(`Movergroup.move IN hostname=${hostname} T`)
        ret = await this.group[hostname].move(bookmarkItem);
      } else {
        // console.log(`Movergroup.move IN keys=${this.keys} hostname=${hostname} F`)
      }
    } else {
      // console.log(`Movergroup.move not undefined`)
    }
    return ret;
  }
}
