/*

Ce script utilise du node.js et un plug in de Google :"Puppeteer", a installe pour run celui ci
   
Ce Script prend une page d'accueil d'une catégorie du grand débat ( type l'écologie à cette adresse :https://granddebat.fr/project/la-transition-ecologique/collect/participez-a-la-recherche-collective-de-solutions-1" )
Il choppe le titre des contributions et le lien vers celle ci.
Il retourne le tout dans un tableau à deux entrées.

Exemple
    [{ url: https://granddebat.fr/projects/la-transition-ecologique/collect/participez-a-la-recherche-collective-de-solutions-1/proposals/supprimer-la-taxe-carbone',
      text: 'stop au nucléaire'},]

*/

const puppeteer = require('puppeteer');
function run (pagesToScrape) {
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
                    let items = document.querySelectorAll('div.card__body__infos');
                    items.forEach((item) => {
                        results.push({
                            url:  item.querySelector('a').getAttribute('href'),
                            text: item.innerText,
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
// et en paramètres de la fonction run on rentre le nombre de page à parser i.e. le nombre de fois où le bot va appuyer sur le bouton "more" en bas de la page
// ici, en l'occurence 10
run(10).then(console.log).catch(console.error);
