export = {
    "get_rewu_links": () =>
    {
        let a_elements = <NodeListOf<HTMLLinkElement>>document.querySelectorAll("a[href*=shop]")
        let return_array: Array<string> = []
        a_elements.forEach(element =>
        {
            if(element.querySelectorAll("span")[1].innerText.indexOf("领完逛逛") == -1)
            {
                return_array.push(<string>element.getAttribute("href"))
            }
        });
        return return_array
    },
    "get_rewu_inner_inframe_src": () =>
    {
        return (<HTMLIFrameElement>document.querySelectorAll("iframe")[0]).getAttribute("src")
    },
    "get_chengjiu_link": async () =>
    {
        return new Promise((succ) =>
        {
            let return_url: string = "";

            (<any>window).open = (_url: string) =>
            {
                return_url = _url
            }

            try
            {
                (<HTMLSpanElement>document.querySelectorAll("body > div > div > div > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(3) > span")[0]).click()
            }
            catch(e)
            {
                succ(false)
            }

            let timeout_handler: NodeJS.Timeout = setInterval(() =>
            {
                if(return_url.length > 0)
                {
                    clearInterval(timeout_handler)
                    succ(return_url)
                }
            }, 100)
        })
    }
}