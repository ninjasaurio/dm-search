const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Configura el User-Agent del navegador
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36');

    // Navega a la página deseada
    await page.goto('https://dragons-and-magic.herokuapp.com/search');

    // Realiza la extracción de datos con Puppeteer
    const data = await page.evaluate(() => {
      // Lógica para extraer los datos
      
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto("https://dragons-and-magic.herokuapp.com/search");
    
        // Leer el archivo card.txt
        const cardList = fs.readFileSync("cards1.txt", "utf-8").split("\n").trim();
    
        const cardMap = new Map();
    
        console.log("Puto el maitro :)")
    
        for (const cardName of cardList) {
          if (cardName.trim() !== "") {
            console.log(`Buscando: ${cardName}`);
    
            // Seleccionar el input de búsqueda
            await page.type("#id_card_name", cardName);
    
            // Seleccionar la opción "In Stock Only"
            await page.click("#id_in_stock_only");
    
            // Hacer clic en el botón de búsqueda
            await page.click("#original-page");
    
            // Agregar un tiempo de espera antes de hacer clic en el botón de búsqueda
            await delay(500);
    
            // Esperar un máximo de 1 segundo a que aparezcan los resultados
            await page
              .waitForSelector(".media.content-section.row", { timeout: 500 })
              .catch(() => {
                console.log(`No se encontraron resultados para: ${cardName}`);
              });
    
            // Agregar un tiempo de espera de 1 segundo
            await delay(500);
    
            const noResultsElement = await page.$(".pl-2.pr-2 > div");
            const noResultsText = await page.evaluate(
              (element) => element.innerText,
              noResultsElement
            );
    
            if (noResultsText.includes("Search was unable to find any results.")) {
              console.log(`No se encontraron resultados para: ${cardName}`);
            } else {
              const elements = await page.$$(".media.content-section.row");
    
              const variants = [];
    
              for (const element of elements) {
                const nameElement = await element.$(".article-content");
                const id = await element.evaluate((el) => el.getAttribute("name"));
                const name = cardName.trim();
    
                const stockElement = await element.$(
                  ".media-body.ml-3 > div:last-child"
                );
                const stockText = stockElement
                  ? await page.evaluate((el) => el.innerText.trim(), stockElement)
                  : "";
                const stock = stockText.includes("in Stock")
                  ? parseInt(stockText, 10)
                  : 0;
                const isStock = stock > 0;
    
                if (isStock) {
                  const imageElement = await element.$(".img-card");
                  const image = await page.evaluate((el) => el.src, imageElement);
    
                  const setElement = await element.$(
                    ".article-content[href^='/advance-search']"
                  );
                  const set = await page.evaluate(
                    (el) => el.innerText.trim(),
                    setElement
                  );
    
                  variants.push({ name, id, set, image, stock });
                }
              }
    
              if (variants.length > 0) {
                const existingCard = cardMap.get(cardName);
                if (existingCard) {
                  existingCard.variants.push(...variants);
                  existingCard.stock += variants.reduce(
                    (totalStock, variant) => totalStock + variant.stock,
                    0
                  );
                  existingCard.isStock = existingCard.stock > 0;
                } else {
                  const cardStock = variants.reduce(
                    (totalStock, variant) => totalStock + variant.stock,
                    0
                  );
                  const isCardStock = cardStock > 0;
                  cardMap.set(cardName, {
                    id: null,
                    name: cardName,
                    stock: cardStock,
                    isStock: isCardStock,
                    variants,
                  });
                }
              } else {
                cardMap.set(cardName, {
                  id: null,
                  name: cardName,
                  stock: 0,
                  isStock: false,
                  variants: [],
                });
              }
            }
    
            // Limpiar el input de búsqueda para la siguiente iteración
            await page.$eval("#id_card_name", (input) => (input.value = ""));
    
            // Desmarcar la opción "In Stock Only"
            await page.$eval("#id_in_stock_only", checkbox => checkbox.checked = false);
          }
        }
    
        const results = Array.from(cardMap.values());

      return extractedData;
    });

    await browser.close();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error durante el scraping' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
