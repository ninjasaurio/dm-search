const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://dragons-and-magic.herokuapp.com/search');

    // Leer el archivo card.txt
    const cardList = fs.readFileSync('card.txt', 'utf-8').split('\n');

    const results = [];

    for (const cardName of cardList) {
      if (cardName.trim() !== '') {
        console.log(`Buscando: ${cardName}`);

        // Seleccionar el input de búsqueda
        await page.type('#id_card_name', cardName);

        // Seleccionar la opción "In Stock Only"
        await page.click('#id_in_stock_only');

        // Hacer clic en el botón de búsqueda
        await page.click('#original-page');

        // Esperar un máximo de 1 segundos a que aparezcan los resultados
        await page.waitForSelector('.media.content-section.row', { timeout: 1000 })
          .catch(() => {
            console.log(`No se encontraron resultados para: ${cardName}`);
            results.push({ name: cardName, stock: 'No disponible' });
          });

        const noResultsElement = await page.$('.pl-2.pr-2 > div');
        const noResultsText = await page.evaluate(element => element.innerText, noResultsElement);

        if (noResultsText.includes('Search was unable to find any results.')) {
          console.log(`No se encontraron resultados para: ${cardName}`);
          results.push({ name: cardName, stock: 'No disponible' });
        } else {
          const stockElement = await page.$('.media-body.ml-3 > div:last-child');
          const stock = stockElement ? await page.evaluate(element => element.innerText.trim(), stockElement) : 'No disponible en stock';
          console.log(`Disponible: ${cardName} - Stock: ${stock}`);
          results.push({ name: cardName, stock });
        }

        // Limpiar el input de búsqueda para la siguiente iteración
        await page.$eval('#id_card_name', input => input.value = '');
      }
    }

    console.log('Resultados:', results);

    // Crear el archivo JSON con los resultados
    fs.writeFileSync('results.json', JSON.stringify(results, null, 2));

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
