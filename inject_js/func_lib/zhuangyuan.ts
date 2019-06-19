let window: any
let friend_btns: Function
let Tiny: any
export = {
    "inject_EventEmitter": () =>
    {
        let old_emit_func = Tiny.EventEmitter.prototype.emit;
        Tiny.EventEmitter.prototype.emit = function ()
        {
            if(this._eventsCount >= 10)
            {
                window.Biz_injected = this
            }
            return old_emit_func.apply(this, arguments)
        }
        return new Promise((succ) =>
        {
            let timeout = setInterval(() =>
            {
                if(typeof window.Biz_injected != "undefined")
                {
                    clearInterval(timeout);
                    succ();
                }
            }, 1000)
        })
    },
    "view_goods": () =>
    {
        window.Biz.task.list.switchGoodsLand[0]()
    },
    "fertilize_it": () =>
    {
        window.Biz_injected.emit("interact:fertilize")
    },
    "water_it": () =>
    {
        window.Biz_injected.emit("interact:water")
        // window.Biz_injected.emit("interact:helpWater")
    },
    "steal": () =>
    {
        window.Biz_injected.emit("stealVege")
    },
    "harvest": () =>
    {
        window.Biz_injected.emit("harvestVege")
    },
    "friend_btns": () => 
    {
        let btns = document.querySelectorAll(".card-item .content .item-action .action .btn")
        return btns
    },
    "has_friend_btn": () =>
    {
        let btns: Array<HTMLDivElement> = friend_btns()
        for (let i = 0; i < btns.length; i++) {
            let item = btns[i];
            if(item.innerHTML.length == 3)
            {
                return i
            }
            
        }
        return false
    },
    "click_friend_btn": (_index: number) =>
    {
        friend_btns()[_index].click()
    },
    "get_friend_btn_content": (_index: number) =>
    {
        return friend_btns()[_index].innerHTML
    },
    "friend_count": () =>
    {
        let friends_div = friend_btns()

        return friends_div.length
    },
    "qian_dao": () =>
    {
        window.Biz_injected.emit("sign")
    },
    "show_all_friend": () =>
    {
        return new Promise((succ) =>
        {
            let timeout_handle = setInterval(() =>
            {
                console.log(`dididi`);
                
                try
                {
                    (<HTMLDivElement>document.querySelectorAll(".card-footer")[0]).click()
                }
                catch(e)
                {
                    clearInterval(timeout_handle)
                    succ()
                }
            }, 1000);
        })
    }
}