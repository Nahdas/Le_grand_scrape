/*

Pareil script en node.js et avec Puppeteer 

Deuxième script, celui prend en paramètre une des url qu'on a scrapé précédemment (bon pour l'instant c'est codé en dur dedans mais ça se modifie rapidement)
Il renvoie un tableau à deux entrée: question et réponse comme suit :
    Exemple:
    [{  question: 
            "Par rapport à votre mode de chauffage actuel, pensez-vous qu'il existe des solutions alternatives plus écologiques ?",
        answer:
            'Oui'
    },]

*/

const puppeteer = require('puppeteer');
function run (pageToScrape) {
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
run("https://granddebat.fr/projects/la-transition-ecologique/collect/participez-a-la-recherche-collective-de-solutions-1/proposals/pour-reduire-le-chauffage-au-fuel-en-milieu-rural").then(console.log).catch(console.error);
