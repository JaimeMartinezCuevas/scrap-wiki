const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/', async (req, res) => {

    const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'
    const html = await axios.get(url);

    const $ = cheerio.load(html.data)

    const musicianLinks = []

    $('#mw-pages a').each((index, element) => {
        const musicianUrl = $(element).attr('href');
        musicianLinks.push(`https://es.wikipedia.org${musicianUrl}`)
    });

    const musiciansData = [];


    for (const link of musicianLinks) {
        const musicianPage = await axios.get(link);
        const musicianPageData = scrapeMusicianPage(musicianPage.data)
        musiciansData.push(musicianPageData)
    }

    res.send(`
      ${musiciansData.map(({ title, imgs, texts }) => `
        <h1>${title}</h1>

        <h2>Imágenes</h2>
        <ul>
          ${imgs.map(img => `<li><a href="${url}${img}" target="_blank">${img}</a></li>`).join('')}
        </ul>

        <h2>Textos</h2>
        <ul>
          ${texts.map(text => `<li>${text}</li>`).join('')}
        </ul>
      `).join('')}
    `)
})


//Scraping col cheerrio (h1, img y p)
function scrapeMusicianPage(html) {
    const $ = cheerio.load(html)

    const title = $('h1').text()

    const images = [];
    $('img').each((index, element) => {
        const imageUrl = $(element).attr('src');
        images.push(imageUrl)
    })

    const texts = [];
    $('p').each((index, element) => {
        const text = $(element).text()
        texts.push(text)
    })

    return { title, links: [], imgs: images, texts };
}


app.listen(3000, () => {
    console.log(`Express está escuchando en el puerto http://localhost:3000`)
})