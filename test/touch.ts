import should from "should";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`touch`, () => 
    {
        it(`tap`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                await _w.screen_touch_emulation()
                _w.open_url(`file:///${__dirname}/../../test/html/touch.html`)
                await sleep(1e3)
                await _w.tap(70, 70)
                await sleep(1e3)
                let is_tap = await _w.exec_js(`is_tap`)
                should(is_tap).equal(true)
            })
        })
    })

})