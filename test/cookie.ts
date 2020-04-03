import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";


describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`cookie`, () => 
    {
        async function server_start(sleep_time: number = 5e3)
        {
            
            let server = new Hapi.Server({
                port: 8181,
                host: 'localhost'
            });
            server.state('data', {
                ttl: null,
                isSecure: true,
                isHttpOnly: true,
                clearInvalid: true,
                strictHeader: true
            });
        
            await server.start();

            server.route({
                method: 'GET',
                path: '/',
                handler: async (request, h) =>
                {
                    
                    h.state("data", "adasd")
                    return `
                    cookie test
                    `
                }
            })

            return server
        }

        it(`应该一直等待直到页面加载完`, async () =>
        {
            let server = await server_start(0)
            await sleep(5 * 60e3)
            // await new Test_M().start(async (_w) =>
            // {
            //     _w.open_url("http://127.0.0.1:8181/")
            //     await _w.wait_page_load()
            //     let a = await _w.exec_js(`a`)
            //     should(a).be.Boolean().and.equal(true)
            //     let b = await _w.exec_js(`b`)
            //     should(b).be.Boolean().and.equal(true)
            // })
            // await server.stop()
        })
    })
})