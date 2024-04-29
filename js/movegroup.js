import { Mover } from './mover.js';
import { parseURLX } from './util.js';

export class Movergroup {
    static mover_group = null;
    static get_mover_group() {
        if (this.mover_group == null) {
            this.mover_group = new Movergroup();
            this.mover_group.add('www.youtube.com', '/Video');
            this.mover_group.add('www.nicovideo.jp', '/Video-nico');
            this.mover_group.add('www.bilibili.com', '/Video-bili');
            this.mover_group.add('www.amazon.co.jp', '/Amazon');
            this.mover_group.add('note.com', '/Note.com');
        }
        return this.mover_group;
    }

    constructor() {
        this.group = {};
        this.keys = [];
    }
    add(hostname, hier) {
        let mover = new Mover(hostname, hier);
        if (mover.dest_parent_item == null) {
            console.log(
                `Movergroup.add hier=${hier} hostname=${hostname} mover.dest_parent_item=${mover.dest_parent_item}`
            );
        }
        this.group[hostname] = mover;
        this.keys = Object.keys(this.group);
    }
    move(bookmarkItem) {
        let ret = false;
        // console.log(`Movergroup.move bookmarkItem.url=${bookmarkItem.url}`)
        // console.log(`Movergroup.move keys=${ Object.keys(this.group) }`)
        if (bookmarkItem.url) {
            let hostname = parseURLX(bookmarkItem.url).then((hostname) => {
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
            console.log(`hostname=${hostname}`);
        } else {
            // console.log(`Movergroup.move not undefined`)
        }
        return ret;
    }
}
