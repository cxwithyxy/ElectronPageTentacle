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
        it(`应该一直等待直到页面加载完`, async () =>
        {
            await (async () => {
                
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
                        await sleep(5e3)
                        return `<script>aaa = true;</script>`
                    }
                })
            })()
            
            class Test_M extends Manager
            {
                async start()
                {
                    this.init_worker()
                    await this.workers_do(async (_w) =>
                    {
                        _w.open_url("http://127.0.0.1:8181/aaa")
                        await _w.wait_page_load()
                        let aaa = await _w.exec_js(`aaa`)
                        console.log(aaa);
                        
                    })
                }
            }

            await new Test_M().start()

        })
    })
})