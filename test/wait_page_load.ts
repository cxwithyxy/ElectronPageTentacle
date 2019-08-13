import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Manager, Worker } from "./../index";
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
            await server_start(5e3)
            

            await new Test_M().start(async (_w) =>
            {
                _w.open_url("http://127.0.0.1:8181/")
                await _w.wait_page_load()
                let aaa = await _w.exec_js(`aaa`)
                should(aaa).be.Boolean().and.equal(true)
            })


        })
    })
})