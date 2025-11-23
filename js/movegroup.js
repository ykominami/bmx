import { Mover } from './mover.js';
import { Util } from './util.js';

export class Movergroup {
    static mover_group = null;

    constructor() {
        this.group = {};
        this.keys = [];
    }

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

    move(bookmarkItem) {
        let ret = false;
        // console.log(`Movergroup.move bookmarkItem.url=${bookmarkItem.url}`)
        // console.log(`Movergroup.move keys=${ Object.keys(this.group) }`)
        if (bookmarkItem.url) {
            let hostname = Util.parseURLX(bookmarkItem.url).then((hostname) => {
                // console.log(`Movergroup.move || hostname=${hostname}`)
                if (this.keys.includes(hostname)) {
                    // console.log(`Movergroup.move IN hostname=${hostname} T`)
                    ret = this.group[hostname].move(bookmarkItem).then((result) => {
                        ret = result;
                    });
                } else {
                    // console.log(`Movergroup.move IN keys=${this.keys} hostname=${hostname} F`)
                }
            });
            // console.log(`hostname=${hostname}`);
        } else {
            // console.log(`Movergroup.move not undefined`)
        }
        return ret;
    }
}
