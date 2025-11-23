export class PopupManager {
    constructor(itemGroup) {
        this.itemGroup = itemGroup;
        this.reg = new RegExp('/Y/DashBoard', '');
    }

    print_with_cond_ret(ret) {
        if (this.reg.exec(ret.hier)) {
            /*
              console.log(`dumpTreeNodes 1 ret.hier=${ret.hier}  Reg.title=${ret.title}`)
           */
        }
    }

    createDumpTreeNodes() {
        const self = this;
        function dumpTreeNodes(bookmarkTreeNodes) {
            return bookmarkTreeNodes.reduce((accumulator, element) => {
                let ret = self.itemGroup.add_to_itemgroup(element, dumpTreeNodes);
                if (ret != null) {
                    self.print_with_cond_ret(ret);
                    accumulator.push(ret);
                }
                return accumulator;
            }, []);
        }
        return dumpTreeNodes;
    }
}
