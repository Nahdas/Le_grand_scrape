const puppeteer = require('puppeteer');

function Get_contributions (pageToScrape) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
			//Url à scraper ici, pareil à modifer pour pouvoir la passer en paramètre par exemple
            await page.goto(pageToScrape);
            await page.waitForSelector('div.proposal__content');
            let urls = await page.evaluate(() => {
                    let results = [];
                    let cont = document.querySelector('div.proposal__content');
                    let items = cont.querySelectorAll('div.block:not(.proposal__buttons) > div');
                    items.forEach((item) => {
                        let index = item.innerText.indexOf("\n\n");
                        results.push({
                            //question:  item.querySelectorAll('h3.h3').innerText,
                            //reponse: item.querySelectorAll('p').innerText,
                            question: item.innerText.substr(0, index),
                            answer: item.innerText.substr(index + 2),
                        });
                    });
                    return results;
                });
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

function Get_links (pagesToScrape) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            //ici on entre l'url de la page à scraper
            await page.goto("https://granddebat.fr/project/la-transition-ecologique/collect/participez-a-la-recherche-collective-de-solutions-1");
            await page.waitForSelector('div.card__body__infos');
            let currentPage = 1;
            let urls = [];
            while (currentPage <= pagesToScrape) {
                let newUrls = await page.evaluate(() => {
                    let results = [];
                    let contrib = [];
                    let nb = 1;
                    let items = document.querySelectorAll('div.card__body__infos');
                    items.forEach((item) => {
                        contrib = Get_contributions(item.querySelector('a').getAttribute('href'));
                        results.push({
                            url:  item.querySelector('a').getAttribute('href'),
                            text: item.innerText,
                            id: nb++,                       
                        });
                    });
                    return results;
                });
                urls = urls.concat(newUrls);
                if (currentPage < pagesToScrape) {
                    await Promise.all([
                        await page.click('button.btn.btn-default'),
                        await page.waitForSelector('div.card__body__infos')
                    ])
                }
                currentPage++;
            }
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}

Get_links(1).then(console.log).catch(console.error);