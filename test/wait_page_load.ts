import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";


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

            server.state('data', {
                ttl: null,
                encoding: 'none',
                strictHeader: false,
                ignoreErrors: false,
                isSecure: false,
                isHttpOnly: true,
                isSameSite: 'Lax',
            });
        
            await server.start();

            server.route({
                method: 'GET',
                path: '/',
                handler: async (request, h) =>
                {
                    await sleep(sleep_time)
                    return `
                    <script>
                    a = 0;
                    b = 0;
                    </script>
                    <script src="a.js"></script>
                    <script src="b.js"></script>
                    `
                }
            })

            server.route({
                method: 'GET',
                path: '/a.js',
                handler: async (request, h) =>
                {
                    await sleep(sleep_time + Math.random() * 5e3)
                    return `a = true;`
                }
            })

            server.route({
                method: 'GET',
                path: '/b.js',
                handler: async (request, h) =>
                {
                    await sleep(sleep_time + Math.random() * 5e3)
                    return `b = true;`
                }
            })

            return server
        }

        it(`应该一直等待直到页面加载完`, async () =>
        {
            let server = await server_start(3e3)
            await new Test_M().start(async (_w) =>
            {
                _w.open_url("http://127.0.0.1:8181/")
                await _w.wait_page_load()
                let a = await _w.exec_js(`a`)
                should(a).be.Boolean().and.equal(true)
                let b = await _w.exec_js(`b`)
                should(b).be.Boolean().and.equal(true)
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