import iconv from "iconv-lite"
import jsdom from "jsdom"
import fs from "fs"
async function main() {

    for(let i = 0; true; i++) {
        const resp = await fetch("https://azby.fmworld.net/app/customer/driversearch/ia/drvialist", {
            "body": `page=${i}&productName=PRIMERGY+RX300+S8+%A5%E9%A5%C3%A5%AF%A5%D9%A1%BC%A5%B9%A5%E6%A5%CB%A5%C3%A5%C8%282.5%A5%A4%A5%F3%A5%C1%A1%DF8%29&productModel=PRIMERGY+RX300+S8+%A5%E9%A5%C3%A5%AF%A5%D9%A1%BC%A5%B9%A5%E6%A5%CB%A5%C3%A5%C8%282.5%A5%A4%A5%F3%A5%C1%A1%DF8%29%2CPYR308R2N2&category=&os=&driverName=`,
            "method": "POST",
            "headers": {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": "lst_session_attr=noparam___app_customer_driversearch_ia_drviadownload; wal_session_attr=noparam___app_customer_driversearch_ia_drvialist"
            },
        });
        const utf8 = iconv.decode(Buffer.from(await resp.arrayBuffer()), "euc-jp")
        const dom = new (new jsdom.JSDOM().window).DOMParser().parseFromString(utf8, "text/html")
        const drivs = dom.querySelectorAll("tbody tr td:nth-child(3) a")
        if(drivs.length == 0) {
            break
        }
        Promise.all(drivs.map(async (a) => {
            // download and write to file
            const resp = await fetch("https://azby.fmworld.net/" + a.href)
            const utf8 = iconv.decode(Buffer.from(await resp.arrayBuffer()), "euc-jp")
            const dom = new (new jsdom.JSDOM().window).DOMParser().parseFromString(utf8, "text/html")
            dom.querySelectorAll("div.frm div p a").forEach(async (a) => {
                console.log("donwloading ", a.href)
                const resp = await fetch(a.href)
                const buf = await resp.arrayBuffer()
                const name = a.href.split("/").pop()
                fs.writeFileSync("/mnt/smb/files/fujitsu_server/drivers/" + name, Buffer.from(buf))
                console.log("donwloaded  ", a.href)
            })
        }))
    }
}
main()