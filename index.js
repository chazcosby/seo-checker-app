const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Common words to filter out from keyword analysis
const commonWords = [
    'able', 'above', 'according', 'accordingly', 'across', 'actually', 'added', 'adj', 'affected', 'affectedly', 'affects', 
    'afterwards', 'again', 'against', 'ah', 'ahead', 'ain', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 
    'also', 'although', 'always', 'am', 'among', 'amongst', 'amoungst', 'amount', 'an', 'and', 'announce', 'another', 'any', 
    'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apparently', 'approximately', 
    'arent', 'arise', 'around', 'aside', 'ask', 'asking', 'auth', 'available', 'away', 'awfully', 'b', 'back', 'became', 
    'because', 'become', 'becomes', 'becoming', 'been', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 
    'being', 'believe', 'below', 'beside', 'besides', 'between', 'beyond', 'biol', 'brief', 'briefly', 'c', 'ca', 'came', 
    'cannot', 'cant', 'cause', 'causes', 'certain', 'certainly', 'co', 'com', 'come', 'comes', 'contain', 'containing', 
    'contains', 'couldnt', 'd', 'date', 'different', 'done', 'down', 'due', 'e', 'each', 'ed', 'edu', 'effect', 'eg', 
    'eight', 'eighty', 'either', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'etc', 'even', 
    'ever', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'far', 'ff', 
    'fifth', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'former', 'formerly', 'forth', 'found', 'four', 
    'furthermore', 'g', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'goes', 'gone', 'got', 
    'gotten', 'h', 'happens', 'hardly', 'hed', 'hence', 'hereafter', 'hereby', 'herein', 'heres', 'hereupon', 'hes', 
    'hid', 'hither', 'home', 'howbeit', 'however', 'hundred', 'i', 'id', 'ie', 'im', 'immediate', 'inasmuch', 'inc', 
    'indeed', 'index', 'instead', 'invention', 'inward', 'itd', 'itll', 'j', 'k', 'keep', 'keeps', 'kept', 'kg', 'km', 
    'know', 'known', 'knows', 'l', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 
    'let', 'lets', 'like', 'liked', 'likely', 'line', 'little', 'look', 'looking', 'looks', 'ltd', 'm', 'made', 'mainly', 
    'make', 'makes', 'many', 'may', 'maybe', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'mg', 'might', 'million', 
    'miss', 'ml', 'more', 'moreover', 'mostly', 'mr', 'mrs', 'much', 'mug', 'must', 'n', 'na', 'name', 'namely', 'nay', 
    'nd', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 
    'nine', 'ninety', 'noone', 'normally', 'nos', 'noted', 'nothing', 'nowhere', 'o', 'obtain', 'obtained', 'obviously', 
    'often', 'oh', 'ok', 'okay', 'old', 'omitted', 'one', 'ones', 'onto', 'ord', 'others', 'otherwise', 'outside', 
    'overall', 'p', 'page', 'part', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 
    'possible', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'provides', 'q', 'que', 'quite', 'qv', 
    'r', 'rather', 'rd', 'readily', 'really', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 
    'related', 'relatively', 'research', 'respectively', 'resulted', 'resulting', 'results', 'right', 'round', 'run', 'said', 
    'saw', 'say', 'saying', 'says', 'second', 'secondly', 'section', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 
    'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shant', 'shed', 'shes', 
    'show', 'showed', 'shown', 'showns', 'shows', 'significant', 'significantly', 'similar', 'similarly', 'since', 'six', 
    'slightly', 'so', 'somebody', 'somehow', 'someone', 'somethan', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 
    'sorry', 'specifically', 'specified', 'specify', 'specifying', 'still', 'stop', 'strongly', 'substantially', 'successfully', 
    'sufficiently', 'suggest', 'sup', 'sure', 't', 'take', 'taken', 'taking', 'tell', 'tends', 'th', 'thank', 'thanks', 
    'thanx', 'thats', 'thatve', 'the', 'their', 'theirs', 'them', 'themselves', 'thence', 'thereafter', 'thereby', 'thered', 
    'therefore', 'therein', 'therell', 'thereof', 'therere', 'theres', 'thereto', 'thereupon', 'thereve', 'theyd', 'theyre', 
    'think', 'thou', 'though', 'thoughh', 'thousand', 'throug', 'throughout', 'thru', 'thus', 'til', 'tip', 'together', 
    'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 'twice', 'two', 'u', 'un', 
    'underneath', 'unfortunately', 'unless', 'unlike', 'unlikely', 'unto', 'upon', 'ups', 'us', 'useful', 'usefully', 
    'usefulness', 'uses', 'using', 'usually', 'v', 'value', 'various', 've', 'via', 'viz', 'vol', 'vols', 'vs', 'w', 
    'want', 'wants', 'wasnt', 'way', 'wed', 'welcome', 'well', 'went', 'werent', 'whatever', 'whatll', 'whats', 'whence', 
    'whenever', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', 'whereupon', 'wherever', 'whether', 'whichever', 
    'while', 'whilst', 'whim', 'whither', 'whod', 'whoever', 'whole', 'whom', 'whose', 'widely', 'willing', 'wish', 
    'within', 'wont', 'words', 'social', 'google', 'are', 'to', 'png', 'jpg', 'logo', 'images', 'world', 'wouldnt', 'my', 'for', 'www', 'x', 'y', 'yes', 'yet', 'youd', 'youre', 'youve', 'can', 'with', 'z', 'your', 'our', 'youre', 'we', 'is', 'how', 'you', 'do', 'what', 'a','zero' 
];

// Helper function to calculate star rating based on optimization level and importance
const calculateStars = (condition, optimalCondition, importance) => {
    let baseStars = condition ? 3 : 1; // Basic optimization check
    if (optimalCondition) baseStars = 5; // Optimal condition met

    // Adjust stars based on importance
    switch(importance) {
        case 'critical':
            baseStars += 1; // Additional star for critical elements
            break;
        case 'high':
            baseStars += 0.5; // Additional half star for high importance
            break;
        case 'low':
            baseStars -= 0.5; // Reduce half star for low importance
            break;
        default:
            break;
    }

    // Ensure stars are within the range of 1 to 5
    return Math.min(Math.max(baseStars, 1), 5);
};

// Function to assess content quality
const assessContentQuality = (content) => {
    // Simulated content quality assessment
    // This can be replaced with more sophisticated algorithms
    const readabilityScore = calculateReadability(content);
    const grammarScore = calculateGrammar(content);
    const relevanceScore = calculateRelevance(content);
    const uniquenessScore = calculateUniqueness(content);

    // Calculate overall quality score
    const qualityScore = (readabilityScore + grammarScore + relevanceScore + uniquenessScore) / 4;

    let recommendation = '';
    if (qualityScore < 50) {
        recommendation = "Improve content quality by creating original, engaging, and relevant content.";
    }
    return { qualityScore, recommendation };
};

// Function to calculate readability score
const calculateReadability = (content) => {
    // Simulated calculation of readability score
    // This can be replaced with an actual readability analysis algorithm
    return 70; // Example score
};

// Function to calculate grammar score
const calculateGrammar = (content) => {
    // Simulated calculation of grammar score
    // This can be replaced with an actual grammar analysis algorithm
    return 80; // Example score
};

// Function to calculate relevance score
const calculateRelevance = (content) => {
    // Simulated calculation of relevance score
    // This can be replaced with an actual relevance analysis algorithm
    return 90; // Example score
};

// Function to calculate uniqueness score
const calculateUniqueness = (content) => {
    // Simulated calculation of uniqueness score
    // This can be replaced with an actual uniqueness analysis algorithm
    return 85; // Example score
};

// Function to check page speed (simple simulation)
const checkPageSpeed = () => {
    // Simulated page speed calculation (random score between 0 and 100)
    return Math.floor(Math.random() * 101);
};

// Function to perform keyword analysis
const analyzeKeywords = (content, headings, metaDescription, altImageTitles) => {
    // Combine text from headings, meta description, and alt image titles
    const allText = [...headings.map(heading => heading.text), metaDescription, ...altImageTitles].join(' ');

    // Extract keywords from combined text
    const words = allText.match(/\b\w+\b/g);

    // Filter out common words and count the frequency of each keyword
    const keywordMap = {};
    if (words) {
        words.forEach(word => {
            const lowercaseWord = word.toLowerCase();
            if (!commonWords.includes(lowercaseWord)) {
                if (keywordMap.hasOwnProperty(lowercaseWord)) {
                    keywordMap[lowercaseWord]++;
                } else {
                    keywordMap[lowercaseWord] = 1;
                }
            }
        });
    }

    // Sort keywords by frequency
    const sortedKeywords = Object.keys(keywordMap).sort((a, b) => keywordMap[b] - keywordMap[a]);

    // Extract top 10 keywords
    const topKeywords = sortedKeywords.slice(0, 10);

    const recommendation = "Optimize content by incorporating relevant keywords naturally.";
    return { keywords: topKeywords, recommendation };
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
        const imagesWithoutAlt = $('img:not([alt])').map((i, el) => $(el).attr('src')).get().filter(image => image); // Get alt text for images
        const content = $('body').text().trim();
        const contentLength = content.length;

        const pageSpeedScore = checkPageSpeed();
        const { qualityScore: contentQualityScore, recommendation: contentQualityRecommendation } = assessContentQuality(content);
        const { keywords, recommendation: keywordRecommendation } = analyzeKeywords(content, headings, metaDescription, imagesWithoutAlt);

        res.json({
            checks: {
                title: {
                    value: title,
                    explanation: "The title tag is crucial for SEO and should accurately reflect the page content.",
                    stars: calculateStars(title.length > 0, title.length > 10 && title.length < 60, 'high'),
                    recommendation: title.length > 0 ? "" : "Add a meaningful title tag to better describe your page."
                },
                metaDescription: {
                    value: metaDescription,
                    explanation: "Meta descriptions provide a summary of your page's content.",
                    stars: calculateStars(!!metaDescription, metaDescription && metaDescription.length > 50 && metaDescription.length < 160, 'high'),
                    recommendation: metaDescription ? "" : "Add a meta description to summarize your page's content."
                },
                isHttps: {
                    value: isHttps ? "Yes" : "No",
                    explanation: "Using HTTPS secures your website and improves its ranking.",
                    stars: calculateStars(isHttps, isHttps, 'critical'),
                    recommendation: isHttps ? "" : "Consider switching to HTTPS to secure your site and improve SEO."
                },
                viewport: {
                    value: viewport ? "Present" : "Not present",
                    explanation: "A viewport meta tag helps with proper rendering on mobile devices.",
                    stars: calculateStars(viewport, viewport, 'high'),
                    recommendation: viewport ? "" : "Define a viewport tag to ensure your site is displayed correctly on all devices."
                },
                contentLength: {
                    value: `${contentLength} characters`,
                    explanation: "Longer content tends to rank better in search engines.",
                    stars: calculateStars(contentLength > 300, contentLength > 1000, 'high'),
                    recommendation: contentLength > 300 ? "" : "Add more quality content to your page to improve SEO."
                },
                pageSpeed: {
                    value: `${pageSpeedScore} / 100`,
                    explanation: "Page speed affects user experience and search engine rankings.",
                    stars: calculateStars(pageSpeedScore > 80, pageSpeedScore > 90, 'high'),
                    recommendation: pageSpeedScore > 80 ? "" : "Improve page speed to enhance user experience and SEO."
                },
                contentQuality: {
                    value: `${contentQualityScore} / 100`,
                    explanation: "Quality content is crucial for SEO and user engagement.",
                    stars: calculateStars(contentQualityScore > 50, contentQualityScore > 70, 'high'),
                    recommendation: contentQualityRecommendation
                },
                keywords: {
                    value: keywords.join(', '),
                    explanation: "Using relevant keywords improves search engine visibility.",
                    stars: calculateStars(keywords.length > 0, keywords.length > 5, 'high'),
                    recommendation: keywordRecommendation
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