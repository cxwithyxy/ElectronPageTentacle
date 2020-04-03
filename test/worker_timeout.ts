import should from "should";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`worker_timeout`, () => 
    {
        let test_url = `file:///${__dirname}/../../test/html/input_work.html`
        
        it(`close后应该在10秒内关闭`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(test_url)
                await _w.wait_page_load()
                await _w.close()
                await sleep(10e3)
                try
                {
                    _w.win.loadURL(test_url)
                    throw new Error(`still alive`)
                }
                catch(e)
                {
                    should(e.message).be.equal("Object has been destroyed")
                }
            })
        })

        it(`超时应该自动关闭`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(test_url)
                await _w.wait_page_load()
                // 设置寿命已经过了600秒
                // 应该在10秒后关闭
                _w.survival_time = 610
                await sleep(15e3)
                try
                {
                    _w.win.loadURL(test_url)
                    throw new Error(`still alive`)
                }
                catch(e)
                {
                    should(e.message).be.equal("Object has been destroyed")
                }
            })
        })
    })

})