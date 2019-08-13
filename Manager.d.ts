import { Worker } from "./index";
export declare class Manager {
    workers: Worker[];
    constructor(_w?: Worker | Worker[]);
    /**
     * 默认初始化worker函数, 建议覆盖后写自己的逻辑
     *
     * @memberof Manager
     */
    init_worker(): void;
    set_main_worker(_w: Worker): Manager;
    get_main_worker(): Worker;
    deliver_main_worker_to(_m: Manager): Manager;
    set_workers(_workers: Worker[]): Manager;
    get_workers(): Worker[];
    add_worker(_w: Worker): void;
    /**
     * 把当前manager手下的worker递交给别的manager进行管理
     *
     * @param {Manager} _m 需要递交到的manager实例
     * @returns {Manager} 返回被递交到的manager实例
     * @memberof Manager
     */
    deliver_workers_to(_m: Manager): Manager;
    /**
     * 增殖worker
     *
     * @param {number} num 需要增殖的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker(num: number, setting?: object): Manager;
    /**
     * 增殖worker到指定数量
     *
     * @param {number} num 需要增殖到的数量
     * @param {object} [setting] worker的基础设置
     * @returns {Manager}
     * @memberof Manager
     */
    proliferate_worker_until(num: number, setting?: object): Manager;
    /**
     * 批量操作所有worker
     *
     * @param {(one_worker: Worker, index?: number) => Promise<any>} _func
     * @memberof Manager
     */
    workers_do(_func: (one_worker: Worker, index?: number) => Promise<any>): Promise<void>;
    /**
     * 把worker们加入垃圾回收队列
     *
     * @memberof Manager
     */
    close_workers(): Promise<void>;
}
