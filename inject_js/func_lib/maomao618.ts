const $ = (a:any):any => {}
export = {
    "has_xiuxi_tangkuang" : () =>
    {
        let body = <HTMLBodyElement>document.querySelectorAll("body")[0]

        return body.innerHTML.indexOf("猫猫在你休息期间产出") != -1
        
    }
}