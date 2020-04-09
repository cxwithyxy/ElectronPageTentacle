import pLimit from 'p-limit'
import _ from "lodash"
import {Worker_type_input} from "./Worker_type_input"

export class Worker_cookie extends Worker_type_input
{
    /**
     * 读取cookies
     *
     * @param {*} [filter={}] 过滤器, 见electron中session的cookies的get方法
     * @returns
     * @memberof Worker
     */
    async read_cookies(filter = {})
    {
            return await this.wincc.session.cookies.get(filter)
         
    }
    
    /**
     * 读取所有cookie, 你可在接下来的操作中进行持久化存储所有cookie的操作
     *
     * @returns {Promise<Array<any>>}
     * @memberof Worker
     */
    async get_all_cookie(): Promise<Array<any>>
    {
        let cookies = <Array<any>>await this.read_cookies()
        return (cookies);
    }
    
    /**
     * 载入cookie
     *
     * @param {string} url 见electron中session.cookies.set方法参数
     * @param {Array<any>} cookies cookie数组, 同见session.cookies
     * @memberof Worker
     */
    async load_all_cookie(url: string, cookies: Array<any>)
    {
        await this.set_cookies(url, cookies)
    }
    
    async set_cookies(url: string, cookies:Array<any> = [])
    {
        let limit:Function = pLimit(cookies.length)
        let queque:Array<any> = [];
        _.forEach(cookies, (v,k) =>
        {
            v.url = url
            if(!_.isUndefined(v.expirationDate))
            {
                v.expirationDate = new Date().getTime() / 1000 + 365 * 24 * 3600
            }
            queque.push(limit(async () =>
            {
                return new Promise((succ) =>
                {
                    this.wincc.session.cookies.set(v)
                })
            }))
        })
        await Promise.all(queque)
    
    }
}