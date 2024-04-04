const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Helper function to calculate star rating based on optimization level and importance
const calculateStars = (condition, optimalCondition) => {
    let baseStars = condition ? 3 : 1; // Basic optimization check
    if (optimalCondition) baseStars = 5; // Optimal condition met
    return baseStars;
};

// Function to check page speed (simple simulation)
const checkPageSpeed = () => {
    // Simulated page speed calculation (random score between 0 and 100)
    return Math.floor(Math.random() * 101);
};

app.post('/check-seo', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('title').first().text();
        const metaDescription = $('meta[name="description"]').attr('content');
        const isHttps = url.startsWith('https://');
        const viewport = $('meta[name="viewport"]').attr('content') ? true : false;
        const headings = $(':header').map((i, el) => ({
            tag: el.tagName.toLowerCase(),
            text: $(el).text()
        })).get().sort((a, b) => {
            const tagOrder = { 'h1': 1, 'h2': 2, 'h3': 3, 'h4': 4, 'h5': 5, 'h6': 6 };
            return tagOrder[a.tag] - tagOrder[b.tag];
        });
        const imagesWithoutAlt = $('img:not([alt])').map((i, el) => ({
            src: $(el).attr('src'),
            displayedSrc: $(el).attr('src').startsWith('http') ? $(el).attr('src') : `${new URL(url).origin}/${$(el).attr('src')}`
        })).get();
        const contentLength = $('body').text().trim().length;

        const pageSpeedScore = checkPageSpeed();

        res.json({
            checks: {
                title: {
                    value: title,
                    explanation: "The title tag is crucial for SEO and should accurately reflect the page content.",
                    stars: calculateStars(title.length > 0, title.length > 10 && title.length < 60),
                    recommendation: title.length > 0 ? "" : "Add a meaningful title tag to better describe your page."
                },
                metaDescription: {
                    value: metaDescription,
                    explanation: "Meta descriptions provide a summary of your page's content.",
                    stars: calculateStars(!!metaDescription, metaDescription && metaDescription.length > 50 && metaDescription.length < 160),
                    recommendation: metaDescription ? "" : "Add a meta description to summarize your page's content."
                },
                isHttps: {
                    value: isHttps ? "Yes" : "No",
                    explanation: "Using HTTPS secures your website and improves its ranking.",
                    stars: calculateStars(isHttps, isHttps),
                    recommendation: isHttps ? "" : "Consider switching to HTTPS to secure your site and improve SEO."
                },
                viewport: {
                    value: viewport ? "Present" : "Not present",
                    explanation: "A viewport meta tag helps with proper rendering on mobile devices.",
                    stars: calculateStars(viewport, viewport),
                    recommendation: viewport ? "" : "Define a viewport tag to ensure your site is displayed correctly on all devices."
                },
                contentLength: {
                    value: `${contentLength} characters`,
                    explanation: "Longer content tends to rank better in search engines.",
                    stars: calculateStars(contentLength > 300, contentLength > 1000),
                    recommendation: contentLength > 300 ? "" : "Add more quality content to your page to improve SEO."
                },
                pageSpeed: {
                    value: `${pageSpeedScore} / 100`,
                    explanation: "Page speed affects user experience and search engine rankings.",
                    stars: calculateStars(pageSpeedScore > 80, pageSpeedScore > 90),
                    recommendation: pageSpeedScore > 80 ? "" : "Improve page speed to enhance user experience and SEO."
                }
            },
            headings,
            imagesWithoutAlt
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching the URL' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
