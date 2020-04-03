import { BrowserWindow } from 'electron'
import sleep from "sleep-promise"
import _ from "lodash"
import {Worker_garbage_conllection} from "./Worker_garbage_conllection"

export class Worker_page extends Worker_garbage_conllection
{
    page_load_lock = false
    
    /**
     * 初始化worker界面显示
     *
     * @returns {Worker}
     * @memberof Worker
     */
    page_init (): Worker_page
    {
        this.win = new BrowserWindow(this.win_settings)
        // this.win.setSkipTaskbar(true)
        this.wincc = this.win.webContents;
        this.ua = this.wincc.getUserAgent();
        this.init_page_load_lock()
        this.hide()
        this.debugger_bridger_init()
        // this.touch_emulation()
        return this
    }

    /**
     * 重新加载窗口页面(刷新)
     *
     * @memberof Worker
     */
    async reload()
    {
        this.wincc.reload()
        await this.wait_page_load()
    }
    
    /**
     * 等待页面加载完成
     *
     * @param {number} [timeout=10e3] 设置超时, 默认10s
     * @returns
     * @memberof Worker
     */
    async wait_page_load(timeout: number = 10e3)
    {
        this.page_load_lock = true
        let timeout_alive = true
        ;(async () =>
        {
            setTimeout(() =>
            {
                if(timeout_alive && this.page_load_lock)
                {
                    this.page_load_lock = false
                    timeout_alive = false
                }
            }, timeout);
        })()
        while(this.page_load_lock)
        {
            await sleep(100)
        }
        timeout_alive = false
        return this
    }
    
    /**
     * 初始化页面加载控制锁
     *
     * @memberof Worker
     */
    init_page_load_lock()
    {
        this.wincc.on("did-stop-loading", () =>
        {
            this.page_load_lock = false
        })
    }
}