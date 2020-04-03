import should from "should";
import sleep from "sleep-promise";
import { Test_M  } from "./lib/Test_M";

describe(`Worker`, function () 
{
    this.timeout(10 * 60e3); 
    describe(`input_work`, () => 
    {
        it(`应该能对react的input进行输入`, async () =>
        {
            await new Test_M().start(async (_w) =>
            {
                let word = `测试${Math.random() * 10000}数字, 英文aaabbbccc`
                _w.open_url(`file:///${__dirname}/../../test/html/input_work.html`)
                await _w.wait_page_load()
                await sleep(2e3)
                await _w.mouse_down(75,10)
                await sleep(1e3)
                await _w.IME_type(word)
                await sleep(2e3)
                await _w.exec_js(`document.querySelector("#main button").click()`)
                let page_a_value = await _w.exec_js(`a`)
                should(page_a_value).equal(word)
            })
        })
    })

})