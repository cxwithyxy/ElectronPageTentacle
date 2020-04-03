import { BrowserWindow, WebContents, clipboard, Event } from 'electron'
import { Inject_js_handler as IJH } from "../Inject_js_handler"
import sleep from "sleep-promise"
import pLimit from 'p-limit'
import _ from "lodash"
import forin_promise from 'forin_promise';
import robotjs from "robotjs"
import {Worker_garbage_conllection} from "./Worker_garbage_conllection"

export class Worker_base
{
    win!: BrowserWindow
    wincc!: WebContents
    win_settings: object
    ua!: string
    inject_js!: IJH
    

    set_inject_js(_ijh: IJH)
    {
        this.inject_js = _ijh
        return this
    }


    constructor (win_settings: {})
    {
        this.win_settings = win_settings;
        this.win_settings = _.merge(this.win_settings, {
            webPreferences: {
                backgroundThrottling: false
            }
        })
    }

    
    open_url (url: string)
    {
        this.wincc.loadURL(url)
        return this;
    }
    
    show()
    {
        // this.win.center()
    }
    
    is_show()
    {
        return false
    }
    
    hide()
    {
        // this.win.setPosition(-1920, 0)
    }

    /**
     * 设置用户UA
     *
     * @param {string} ua
     * @returns {Worker_base}
     * @memberof Worker_base
     */
    set_ua (ua: string): Worker_base
    {
        this.wincc.setUserAgent(ua);
        this.ua = ua;
        return this;
    }
    
    /**
     * 打开控制台
     *
     * @returns {Worker_base}
     * @memberof Worker_base
     */
    open_dev(): Worker_base
    {
        this.wincc.openDevTools({mode: "undocked"});
        return this;
    }

    // 该函数等待废弃
    async shine_focus(_when_shine_do: () => Promise<any>)
    {
        this.wincc.focus()
        await sleep(300)
        await _when_shine_do()
    }

    /**
     * 在窗口上下文中运行js代码
     *
     * @param {string} js_code
     * @returns
     * @memberof Worker
     */
    async exec_js(js_code: string)
    {
        return await this.wincc.executeJavaScript(
            this.inject_js.to_code_string(js_code)
        );
    }

    /**
     * 初始化debugger调试, 便于实现后续功能
     *
     * @memberof Worker
     */
    debugger_bridger_init()
    {
        try
        {
            this.wincc.debugger.attach(`1.3`)
        }
        catch (err)
        {
            console.log('Debugger attach failed : ', err)
        }

        this.wincc.debugger.on('detach', (event, reason) => 
        {
            console.log('Debugger detached due to : ', reason)
        })
    }
}