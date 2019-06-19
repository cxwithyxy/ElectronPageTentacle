import { Worker } from "./Worker"
import * as _ from "lodash"
import pLimit from 'p-limit'

export class Manager
{
    workers!: Worker[];

    constructor(_w?: Worker | Worker[]){
        if(! _.isUndefined(_w) && !_.isArray(_w))
        {
            this.workers = [_w];
        }
        if(_.isArray(_w))
        {
            this.workers = _w;
        }
        if(_.isUndefined(_w))
        {
            this.workers = [];
        }
    }

    start()
    {
        
    }

    set_main_worker(_w: Worker): Manager
    {
        let main_worker = _.head(this.workers)
        if(_.isUndefined(main_worker))
        {
            this.workers.push(_w)
        }
        else
        {
            this.workers[0] = _w;
        }
        return this;
    }

    get_main_worker(): Worker
    {
        let main_worker = _.head(this.workers)
        if(_.isUndefined(main_worker))
        {
            throw new Error("main_worker_have_not_set");
        }
        return main_worker;
    }

    deliver_main_worker_to(_m: Manager): Manager
    {
        return _m.set_main_worker(this.get_main_worker());
    }

    set_workers(_workers: Worker[]): Manager
    {
        this.workers = _workers
        return this
    }

    get_workers(): Worker[]
    {
        return this.workers
    }

    add_worker(_w: Worker)
    {
        this.workers.push(_w);
    }

    /**
     * 把当前manager手下的worker递交给别的manager进行管理
     *
     * @param {Manager} _m 需要递交到的manager实例
     * @returns {Manager} 返回被递交到的manager实例
     * @memberof Manager
     */
    deliver_workers_to(_m: Manager): Manager
    {
        return _m.set_workers(this.get_workers())
    }

    /**
     * 增殖worker
     *
     * @param {number} num 需要增殖的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker(num: number, setting?: object): Manager
    {
        let base_worker:Worker = this.get_main_worker()
        let current_url:string = base_worker.wincc.getURL()
        while(num--)
        {
            if(_.isUndefined(setting))
            {
                setting = base_worker.win_settings
            }
            let temp_worker = new Worker(setting).page_init()
            temp_worker.set_ua(base_worker.ua)
            temp_worker.open_url(current_url)
            this.add_worker(temp_worker)
        }
        
        return this
    }

    /**
     * 增殖worker到指定数量
     *
     * @param {number} num 需要增殖到的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker_until(num: number, setting?: object): Manager
    {
        let now_workers = this.get_workers()

        return this.proliferate_worker(num - now_workers.length, setting)
    }

    /**
     * 批量操作所有worker
     *
     * @param {(one_worker: Worker, index?: number) => Promise<any>} _func
     * @memberof Manager
     */
    async workers_do(_func: (one_worker: Worker, index?: number) => Promise<any>)
    {
        let limit:Function = pLimit(this.get_workers().length)
        let queque:Array<any> = [];
        _.forEach(this.get_workers(), (v,k) =>
        {
            queque.push(limit(async () =>
            {
                await _func(v, k)
            }))
        })
        await Promise.all(queque)
    }

    /**
     * 把worker们加入垃圾回收队列
     *
     * @memberof Manager
     */
    async close_workers()
    {
        await this.workers_do(async (_w: Worker) =>
        {
            _w.close()
        })
    }

}