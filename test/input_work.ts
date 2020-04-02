import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Manager, Worker } from "./../src/index";
import { app } from "electron";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`input_work`, () => 
    {
        class Test_M extends Manager
        {
            async start(_func: (_w: Worker) => Promise<void>)
            {
                this.init_worker()
                await this.workers_do(_func)
            }
        }
        it(`应该能对react的input进行输入`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                _w.open_url("https://ant.design/components/input-cn/")
                await _w.wait_page_load()
                await sleep(3e3)
                await _w.mouse_down(305,479)
                await _w.IME_type("吹啊吹啊我的骄傲放纵啊啊啊")
                
                await sleep(60*60e3)
            })
        })
    })

})