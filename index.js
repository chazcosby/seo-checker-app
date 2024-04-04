const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 3000;

app.post('/check-seo', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try {
        const startTime = Date.now();
        const response = await axios.get(url);
        const loadTime = Date.now() - startTime;

        const $ = cheerio.load(response.data);
        const title = $('title').first().text();
        const metaDescription = $('meta[name="description"]').attr('content');
        const isHttps = url.startsWith('https://');
        const viewport = $('meta[name="viewport"]').attr('content') ? true : false;
        const headings = { h1: $('h1').length, h2: $('h2').length };
        const contentLength = $('body').text().length;
        const robots = await axios.get(`${new URL(url).origin}/robots.txt`).then(() => true).catch(() => false);
        const imagesWithAlt = $('img[alt]').length;
        const cleanURL = !url.includes("?") && !url.includes("#") && !url.includes("&");
        const favicon = $('link[rel="shortcut icon"], link[rel="icon"]').length > 0;
        const canonical = $('link[rel="canonical"]').length > 0;

        res.json({
            title,
            metaDescription,
            isHttps,
            viewport,
            headings,
            contentLength,
            robots,
            imagesWithAlt,
            pageSpeed: `${loadTime} ms`,
            cleanURL,
            favicon,
            canonical
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching the URL' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
