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

    constructor (win_settings: {})
    {
        this.win_settings = win_settings;
        this.win_settings = _.merge(this.win_settings, {
            webPreferences: {
                backgroundThrottling: false
            }
        })
    }
}