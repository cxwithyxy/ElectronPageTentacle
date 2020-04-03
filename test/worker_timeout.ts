import should from "should";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`worker_timeout`, () => 
    {
        it(`close后应该在10秒内关闭`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                let test_url = `file:///${__dirname}/../../test/html/input_work.html`
                _w.open_url(test_url)
                await _w.wait_page_load()
                await _w.close()
                await sleep(10e3)
                try
                {
                    _w.win.loadURL(test_url)
                }
                catch(e)
                {
                    should(e.message).be.equal("Object has been destroyed")
                }
            })
        })
    })

})