import { Manager, Worker } from "./../../src/index";
export class Test_M extends Manager
{
    async start(_func: (_w: Worker) => Promise<void>)
    {
        this.init_worker()
        await this.workers_do(_func)
        await this.close_workers()
    }
}