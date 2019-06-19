import { IpcRenderer as Ipcr } from "electron"
const $ = (a:any):any => {}
let ipcRenderer!:Ipcr

export = {
    "login_input_set": (_u: string, _p: string) =>
    {
        let un = <HTMLInputElement>(document.querySelectorAll("#username")[0])
        let pw = <HTMLInputElement>(document.querySelectorAll("#password")[0])
        un.value = _u
        pw.value = _p
    },
    "is_login": () =>
    {
        return !document.querySelectorAll("#btn-submit").length
    },
    "login_click_event": () =>
    {
        let btn = <HTMLElement>(document.querySelectorAll("#btn-submit")[0])
        
        btn.addEventListener("click", () =>
        {
            let un = <HTMLInputElement>(document.querySelectorAll("#username")[0])
            let pw = <HTMLInputElement>(document.querySelectorAll("#password")[0])
            ipcRenderer.send("login_btn_click", un.value, pw.value)
        })

    }
}