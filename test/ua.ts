import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";


describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`ua`, () => 
    {
        let ua = `UA${Math.random() * 1000}`
        let client_ua = ""
        let server_url = `http://127.0.0.1:8181/`
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
                    client_ua = request.headers['user-agent']
                    return ``
                    
                }
            })

            return server
        }

        it(`修改ua`, async () =>
        {
            let server = await server_start(0)
            await new Test_M().start(async (_w) =>
            {
                _w.set_ua(ua)
                _w.open_url(server_url)
                await _w.wait_page_load()
                should(client_ua).equal(ua)
            })
            await server.stop()
        })

    })
})