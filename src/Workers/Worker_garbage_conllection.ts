import _ from "lodash"
import forin_promise from 'forin_promise';
import {Worker_base} from "./Worker_base"

export class Worker_garbage_conllection extends Worker_base
{
    /**
     * 控制worker是否会被垃圾回收
     *
     * @memberof Worker_garbage_conllection
     */
    garbage_collection_marker = false
    
    /**
     * 当前已存活时间, 超过最大存活时间应该会被垃圾回收
     *
     * @memberof Worker_garbage_conllection
     */
    survival_time = 0
     
    /**
     * 最大存活时间
     *
     * @memberof Worker_garbage_conllection
     */
    max_survival_time = 60 * 10
    
    /**
     * worker存活时间控制句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker_garbage_conllection
     */
    static worker_survival_timeout: NodeJS.Timeout
    
    /**
     * 全局的worker储存器, 便于垃圾回收等相关机制获取worker对象
     *
     * @static
     * @type {Array<Worker>}
     * @memberof Worker_garbage_conllection
     */
    static worker_box: Array<Worker_garbage_conllection> = []
     
    /**
     * 垃圾回收定时器句柄
     *
     * @static
     * @type {NodeJS.Timeout}
     * @memberof Worker_garbage_conllection
     */
    static worker_garbage_collection_timeout: NodeJS.Timeout
     
    /**
     * 添加worker实例到全局worker实例数组中
     *
     * @static
     * @param {Worker} _w 要被添加的worker实例
     * @memberof Worker_garbage_conllection
     */
    static add_worker(_w: Worker_garbage_conllection)
    {
        Worker_garbage_conllection.worker_box.push(_w)
        Worker_garbage_conllection.start_garbage_collection()
        Worker_garbage_conllection.start_survival_process()
    }
    
    static get_workers()
    {
        return Worker_garbage_conllection.worker_box
    }
    
    /**
     * 启动垃圾回收机制, 每5秒执行一次
     *
     * @static
     * @memberof Worker_garbage_conllection
     */
    static start_garbage_collection()
    {
        if(_.isUndefined(Worker_garbage_conllection.worker_garbage_collection_timeout))
        {
            Worker_garbage_conllection.worker_garbage_collection_timeout = setInterval(() =>
            {
                _.remove(Worker_garbage_conllection.worker_box, (_w: Worker_garbage_conllection) =>
                {
                    if(_w.garbage_collection_marker)
                    {
                        try
                        {
                            _w.win.close()
                        }
                        catch (error){}
                    }
                    return _w.garbage_collection_marker
                })
            }, 5000)
            return
        }
         
    }
    
    /**
     * 启动存活核算进程
     *
     * @static
     * @memberof Worker_garbage_conllection
     */
    static start_survival_process()
    {
        if(!_.isUndefined(Worker_garbage_conllection.worker_survival_timeout))
        {
            return
        }
        Worker_garbage_conllection.worker_survival_timeout = setInterval(async () =>
        {
            await Worker_garbage_conllection.all_worker_do(async (_w) =>
            {
                _w.survival_time += 5;
                if(_w.survival_time >= _w.max_survival_time)
                {
                    _w.close()
                }
            })
        }, 5000)
    }
    
    /**
     * 续命
     *
     * @param {number} adding_time 要续命多少秒呢
     * @memberof Worker_garbage_conllection
     */
    give_me_a_life(adding_time: number)
    {
        this.max_survival_time = this.survival_time + adding_time
    }

    /**
     * 批量操作所有的worker
     *
     * @static
     * @param {(_w: Worker) => Promise<any>} _func
     * @memberof Worker_garbage_conllection
     */
    static async all_worker_do(_func: (_w: Worker_garbage_conllection) => Promise<any>)
    {
        await forin_promise(
            Worker_garbage_conllection.worker_box,
            async (_v, _k) =>
            {
                _func(_v)
            }
        )
    }

    /**
     * 把Worker置于等待垃圾回收队列中
     *
     * @memberof Worker
     */
    close()
    {
        this.garbage_collection_marker = true
    }

    constructor (win_settings: {})
    {
        super(win_settings)
        Worker_garbage_conllection.add_worker(this)
    }
}