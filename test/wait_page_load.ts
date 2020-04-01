import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Manager, Worker } from "./../src/index";
import { app } from "electron";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`wait_page_load`, () => 
    {
        async function server_start(sleep_time: number = 5e3)
        {
            
            let server = new Hapi.Server({
                port: 8181,
                host: 'localhost'
            });
        
            await server.start();

            server.route({
                method: 'GET',
                path: '/',
                handler: async (request, h) =>
                {
                    await sleep(sleep_time)
                    return `<script>aaa = true;</script>`
                }
            })

            return server
        }

        class Test_M extends Manager
        {
            async start(_func: (_w: Worker) => Promise<void>)
            {
                this.init_worker()
                await this.workers_do(_func)
            }
        }

        it(`应该一直等待直到页面加载完`, async () =>
        {
            let server = await server_start(3e3)
            await new Test_M().start(async (_w) =>
            {
                _w.open_url("http://127.0.0.1:8181/")
                await _w.wait_page_load()
                let aaa = await _w.exec_js(`aaa`)
                should(aaa).be.Boolean().and.equal(true)
            })
            await server.stop()
        })

        it(`超时加载`, async () =>
        {
            let server = await server_start(10e3)
            await new Test_M().start(async (_w) =>
            {
                let start_time = +new Date()
                _w.open_url("http://127.0.0.1:8181/")
                await _w.wait_page_load(3e3)
                let now_time = +new Date()
                should(now_time-start_time).belowOrEqual(5e3)
            })
            await server.stop()
        })
    })
})