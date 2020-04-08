import should from "should";
import Hapi from "@hapi/hapi";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";


describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`cookie`, () => 
    {
        let cookie_preset = `I am ${Math.random()} Cookie`
        let cookie_server_get = ""
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
                    let current_cookie = ""
                    cookie_server_get = request.state.data
                    if(cookie_server_get)
                    {
                        current_cookie = cookie_server_get
                    }
                    else
                    {
                        current_cookie = cookie_preset
                    }
                    h.state('data', current_cookie)
                    return `
                    <h1>
                    cookie: ${current_cookie}
                    </h1>
                    <script>
                    cookie_value = "${current_cookie}"
                    </script>
                    `
                    
                }
            })

            return server
        }

        it(`获得服务器cookie`, async () =>
        {
            let server = await server_start(0)
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(server_url)
                await _w.wait_page_load()
                let cookie_from_server = (await _w.get_all_cookie())[0]
                should(cookie_from_server["value"]).equal(cookie_preset)
            })
            await server.stop()
        })

        it(`设置cookie`, async () =>
        {
            let server = await server_start(0)
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(server_url)
                await _w.wait_page_load()
                let cookie_from_server = (await _w.get_all_cookie())[0]
                let client_reset_cookie_value = `${cookie_from_server["value"]}, but change by client`
                cookie_from_server["value"] = client_reset_cookie_value
                _w.load_all_cookie(server_url,[cookie_from_server])
                await _w.reload()
                let cookie_from_server_second = await _w.exec_js(`cookie_value`)
                should(cookie_from_server_second).equal(client_reset_cookie_value)

            })
            await server.stop()
        })
    })
})