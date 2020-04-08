import should from "should";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`mouse`, () => 
    {
        it(`click`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                await _w.screen_touch_emulation()
                _w.open_url(`file:///${__dirname}/../../test/html/mouse.html`)
                await sleep(1e3)
                let button_clicked = await _w.exec_js(`button_clicked`)
                let menu_clicked = await _w.exec_js(`menu_clicked`)
                should(button_clicked).equal(false)
                should(menu_clicked).equal(false)
                await _w.click(34, 22)
                await sleep(1e3)
                button_clicked = await _w.exec_js(`button_clicked`)
                should(button_clicked).equal(true)
                await _w.click(62,78)
                await sleep(1e3)
                menu_clicked = await _w.exec_js(`menu_clicked`)
                should(menu_clicked).equal(true)
            })
        })
    })

})