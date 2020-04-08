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

        it(`hover`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(`file:///${__dirname}/../../test/html/mouse.html`)
                await sleep(1e3)
                let hover_than_clicked = await _w.exec_js(`hover_than_clicked`)
                should(hover_than_clicked).equal(false)
                await _w.mouse_move(30, 76)
                await sleep(2e3)
                await _w.click(52, 209)
                await sleep(1e3)
                hover_than_clicked = await _w.exec_js(`hover_than_clicked`)
                should(hover_than_clicked).equal(true)
            })
        })

        it(`drag`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                _w.open_url(`file:///${__dirname}/../../test/html/mouse_drag.html`)
                await sleep(1e3)
                let slider_value = await _w.exec_js(`slider_value`)
                should(slider_value).equal(20)
                await _w.mouse_drag_drop(85, 17, 264, 17)
                await sleep(1e3)
                slider_value = await _w.exec_js(`slider_value`)
                should(slider_value).greaterThan(20)
            })
        })
    })

})