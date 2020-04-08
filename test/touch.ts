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
                let is_tap = await _w.exec_js(`is_tap`)
                should(is_tap).equal(false)
                await _w.tap(70, 70)
                await sleep(1e3)
                is_tap = await _w.exec_js(`is_tap`)
                should(is_tap).equal(true)
            })
        })

        it(`touch_move`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                await _w.screen_touch_emulation()
                _w.open_url(`file:///${__dirname}/../../test/html/touch.html`)
                await sleep(1e3)
                let is_touch_move = await _w.exec_js(`is_touch_move`)
                should(is_touch_move).equal(false)
                await _w.touch_move(100, 500, 210, 70, 70, 70)
                await sleep(1e3)
                is_touch_move = await _w.exec_js(`is_touch_move`)
                should(is_touch_move).equal(true)
            })
        })
    })

})