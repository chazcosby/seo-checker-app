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
    'within', 'wont', 'object', 'words', 'social', 'google', 'are', 'to', 'png', 'jpg', 'logo', 'images', 'world', 'wouldnt', 'my', 'for', 'www', 'x', 'y', 'yes', 'yet', 'youd', 'youre', 'youve', 'can', 'with', 'z', 'your', 'our', 'youre', 'we', 'is', 'how', 'you', 'do', 'what', 'a','zero' 
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


/* Adjusted Function to assess content quality with a scaling factor
const assessContentQuality = (content, topKeywords) => {
    const readabilityScore = calculateReadability(content);
    const grammarScore = calculateGrammar(content);
    const relevanceScore = calculateRelevance(content, topKeywords); // Ensure topKeywords are correctly passed
    const uniquenessScore = calculateUniqueness(content);
    const keywordDensityScore = calculateKeywordDensity(content);
    const sentimentScore = calculateSentiment(content);

    // Weights based on adjusted importance for SEO
    const weights = {
        readability: 0.25,
        grammar: 0.05,
        relevance: 0.30,
        uniqueness: 0.20,
        keywordDensity: 0.15,
        sentiment: 0.05
    };

    // Calculate weighted score without scaling
    let weightedScore = (
        (readabilityScore * weights.readability) +
        (grammarScore * weights.grammar) +
        (relevanceScore * weights.relevance) +
        (uniquenessScore * weights.uniqueness) +
        (keywordDensityScore * weights.keywordDensity) +
        (sentimentScore * weights.sentiment)
    ) / (weights.readability + weights.grammar + weights.relevance + weights.uniqueness + weights.keywordDensity + weights.sentiment);

    // Apply a scaling factor to adjust the score closer to other SEO tools
    // This factor can be adjusted based on further calibration with other tools' scores
    const scalingFactor = 2; // Example factor to adjust the score upwards
    let adjustedScore = weightedScore * scalingFactor;

    // Ensure the final score is within 0-100 range
    adjustedScore = Math.min(Math.max(adjustedScore, 0), 100);

    let recommendation = '';
    if (adjustedScore < 50) {
        recommendation = "Improve content quality by creating original, engaging, and relevant content.";
    } else if (adjustedScore >= 50 && adjustedScore < 75) {
        recommendation = "Good content quality. Consider refining readability and keyword usage for further improvement.";
    } else {
        recommendation = "Excellent content quality. Keep up the good work!";
    }
    return { qualityScore: adjustedScore.toFixed(2), recommendation };
};

*/

// Function to calculate keyword density
const calculateKeywordDensity = (content) => {
    const words = content.split(/\s+/).filter(Boolean).length;
    const keywordPattern = /\b(keyword1|keyword2|...)\b/g; // Replace with actual keywords
    const keywordMatches = content.match(keywordPattern) || [];
    const keywordDensity = (keywordMatches.length / words) * 100;
    // Ideal keyword density is around 1% to 2%
    if (keywordDensity > 1 && keywordDensity < 2) {
        return 100;
    } else if (keywordDensity <= 1 || keywordDensity >= 2 && keywordDensity <= 5) {
        return 75;
    } else {
        return 50;
    }
};

// Function to calculate sentiment analysis score
const calculateSentiment = (content) => {
    // Predefined lists of positive and negative words
    const positiveWords = ['happy', 'joy', 'brilliant', 'great', 'good', 'wonderful', 'positive', 'satisfied', 'love'];
    const negativeWords = ['sad', 'bad', 'terrible', 'horrible', 'negative', 'angry', 'hate', 'worse', 'worst'];

    let positiveCount = 0;
    let negativeCount = 0;

    // Tokenize the content into words
    const words = content.toLowerCase().split(/\W+/);

    // Count the occurrences of positive and negative words
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });

    // Calculate sentiment score
    const totalWords = positiveCount + negativeCount;
    if (totalWords === 0) return 75; // Neutral score if no positive/negative words are found

    const positivityRate = (positiveCount / totalWords) * 100;
    const negativityRate = (negativeCount / totalWords) * 100;

    // Simplified sentiment score calculation
    if (positivityRate > negativityRate) {
        return 75 + (positivityRate - negativityRate) / 2; // Score between 75 and 100 for positive sentiment
    } else if (negativityRate > positivityRate) {
        return 75 - (negativityRate - positivityRate) / 2; // Score between 50 and 75 for negative sentiment
    } else {
        return 75; // Perfectly neutral
    }
};



// Function to calculate readability score
const calculateReadability = (content) => {
    const sentences = content.match(/[\w|\)][.?!](\s|$)/g)?.length || 1;
    const words = content.match(/\w+/g)?.length || 1;
    const syllables = content.match(/\b[aeiouy]{1,2}/gi)?.length || 1;
    
    const averageSentenceLength = words / sentences;
    const averageSyllablesPerWord = syllables / words;
    const readabilityScore = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
    
    return Math.max(0, Math.min(readabilityScore.toFixed(0), 100)); // Ensure the score is between 0 and 100
};



// Function to calculate grammar score
const calculateGrammar = (content) => {
    let mistakes = 0;
    // Find repeated words
    const wordPattern = /\b(\w+)\s+\1\b/ig; 
    // Common contractions and their/these/they're, your/you're, etc.
    const contractionPattern = /\b(it's|you're|they're|we're|she's|he's|that's|who's|what's)\b/ig; 
    const theirThereTheyrePattern = /\b(their|there|they're)\b/ig;
    const yourYourePattern = /\b(your|you're)\b/ig;
    const apostropheMisusePattern = /\b(\w+'s)\b/ig; // Simplistic check for misuse of apostrophes

    mistakes += (content.match(wordPattern) || []).length;
    mistakes += (content.match(contractionPattern) || []).length;
    // Additional checks for common mistakes
    mistakes += checkMisuse(content, theirThereTheyrePattern, ['their', 'there', 'they\'re']);
    mistakes += checkMisuse(content, yourYourePattern, ['your', 'you\'re']);
    mistakes += checkApostropheMisuse(content, apostropheMisusePattern);

    // Assume 1 mistake per 100 words is average, 0 mistakes is excellent
    const words = content.split(/\s+/).filter(Boolean).length;
    const score = 100 - (mistakes / words) * 10000; // Scale mistake impact
    return Math.max(0, Math.min(Math.round(score), 100)); // Normalize to 0-100 scale
};

// Helper function to check misuse of similar words
function checkMisuse(content, pattern, words) {
    let misuseCount = 0;
    let matches = content.match(pattern) || [];
    matches.forEach(match => {
        // This is a simplified approach and may count correct uses as mistakes based on frequency of appearance
        if (words.includes(match.toLowerCase())) misuseCount++;
    });
    return misuseCount;
}

// Helper function to check for apostrophe misuse in plural nouns
function checkApostropheMisuse(content, pattern) {
    let misuseCount = 0;
    let matches = content.match(pattern) || [];
    matches.forEach(match => {
        // If the word ends with 's and is followed by a verb, it's likely misused
        if (match.toLowerCase().endsWith('s')) misuseCount++;
    });
    return misuseCount;
}


const calculateUniqueness = (content) => {
    const segments = content.split(/\.\s+/); // Split into sentences or segments
    const totalSegments = segments.length;
    
    let uniqueSegments = new Set();
    let similarityIndex = 0; // Additional measure for near-duplicate content

    segments.forEach(segment => {
        // Basic normalization of segment for comparison
        const normalizedSegment = segment.toLowerCase().replace(/[^a-z0-9]+/g, '');

        // Check for exact matches
        let isUnique = true;
        uniqueSegments.forEach(uniqueSegment => {
            if (uniqueSegment === normalizedSegment) {
                isUnique = false;
            }
        });

        // Check for near-duplicates
        if (isUnique) {
            uniqueSegments.forEach(uniqueSegment => {
                if (Math.abs(uniqueSegment.length - normalizedSegment.length) < 5) {
                    const commonLength = longestCommonSubstring(uniqueSegment, normalizedSegment).length;
                    const similarityRatio = commonLength / Math.min(uniqueSegment.length, normalizedSegment.length);
                    if (similarityRatio > 0.8) {
                        isUnique = false;
                        similarityIndex++;
                    }
                }
            });
        }

        if (isUnique) {
            uniqueSegments.add(normalizedSegment);
        }
    });

    const uniqueScore = (uniqueSegments.size / totalSegments) * 100;
    const adjustedUniquenessScore = uniqueScore - (similarityIndex * 5); // Penalize for similarity
    return Math.round(Math.max(0, Math.min(adjustedUniquenessScore, 100))); // Ensure score is within 0-100
};

// Helper function to find the longest common substring between two strings
function longestCommonSubstring(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
    let maxLength = 0;
    let endingIndex = 0;

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str1[j - 1] === str2[i - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
                if (matrix[i][j] > maxLength) {
                    maxLength = matrix[i][j];
                    endingIndex = j;
                }
            } else {
                matrix[i][j] = 0;
            }
        }
    }

    return str1.substring(endingIndex - maxLength, endingIndex);
}









// Function to calculate relevance score
const calculateRelevance = (content, topKeywords) => {
    if (!topKeywords || topKeywords.length === 0) return 0; // Requires keywords to evaluate

    let totalScore = 0;
    topKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        let occurrences = (content.match(regex) || []).length;
        let score = occurrences * 2; // Base score, term frequency

        // Bonus for keyword appearance in first 100 words
        const first100Words = content.split(/\s+/).slice(0, 100).join(' ');
        if (first100Words.match(regex)) {
            score += 5;
        }

        // Bonus for keyword appearance in headings (assuming <h1>, <h2>, etc. are marked with # in markdown or similar)
        const headings = content.match(/#+\s(.*)/g) || [];
        headings.forEach(heading => {
            if (heading.match(regex)) {
                score += 10; // Higher importance for heading occurrences
            }
        });

        totalScore += score;
    });

    // Normalize score
    const normalizedScore = Math.min(100, (totalScore / topKeywords.length) * 10);
    return Math.round(normalizedScore); // Return normalized relevance score
};



// Function to check page speed (simple simulation)
const checkPageSpeed = async (url) => {
    try {
        const start = Date.now();
        const response = await axios.get(url, { timeout: 10000 });
        const end = Date.now();
        const duration = end - start;

        let serverResponseTime = duration;
        let isCompressed = ['gzip', 'br'].includes(response.headers['content-encoding']);

        const htmlSize = response.headers['content-length'] ? parseInt(response.headers['content-length'], 10) : 0;
        const isHtmlSizeOptimized = htmlSize < 1024 * 100; // Consider HTML optimized if less than 100KB

        let speedScore = 100 - (serverResponseTime / 10);
        speedScore += isCompressed ? 10 : 0;
        speedScore -= isHtmlSizeOptimized ? 0 : 10;

        speedScore = Math.max(0, Math.min(speedScore, 100));

        return speedScore.toFixed(0); // Return the score as a string
    } catch (error) {
        console.error('Error measuring page speed:', error);
        return "0"; // Return "0" as a string if there's an error
    }
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
        let relevantTexts = [];
        $('h1, h2, h3, h4, h5, h6').each(function() {
            relevantTexts.push($(this).text().trim());
        });
        $('p').each(function() {
            relevantTexts.push($(this).text().trim());
        });
        $('img').each(function() {
            const altText = $(this).attr('alt');
            if (altText) {
                relevantTexts.push(altText.trim());
            }
        });
        const combinedContent = relevantTexts.join(' ').replace(/\s+/g, ' ').trim();
        const contentLength = combinedContent.length;

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
            alt: $(el).attr('alt') || 'Missing Alt Text'
        })).get();

        const pageSpeedScore = await checkPageSpeed(url);
        const { keywords, recommendation: keywordRecommendation } = analyzeKeywords(combinedContent, headings, metaDescription, imagesWithoutAlt.map(image => image.alt));

        // Calculate additional scores
        const readabilityScore = calculateReadability(combinedContent);
        const grammarScore = calculateGrammar(combinedContent);
        const uniquenessScore = calculateUniqueness(combinedContent);
        const keywordDensityScore = calculateKeywordDensity(combinedContent);
        const sentimentScore = calculateSentiment(combinedContent);

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
                    explanation: "Content length is calculated from headings, paragraphs, and image alt texts, indicating the amount of meaningful text.",
                    stars: calculateStars(contentLength > 300, contentLength > 1000, 'high'),
                    recommendation: contentLength > 300 ? "" : "Add more quality content to your page to improve SEO."
                },
                pageSpeed: {
                    value: `${pageSpeedScore} / 100`,
                    explanation: "Page speed affects user experience and search engine rankings.",
                    stars: calculateStars(pageSpeedScore > 80, pageSpeedScore > 90, 'high'),
                    recommendation: pageSpeedScore > 80 ? "" : "Improve page speed to enhance user experience and SEO."
                },
                keywords: {
                    value: keywords.join(', '),
                    explanation: "Using relevant keywords improves search engine visibility.",
                    stars: calculateStars(keywords.length > 0, keywords.length > 5, 'high'),
                    recommendation: keywordRecommendation
                },
                // Added results display for additional scores
                readability: {
                    value: `${readabilityScore} / 100`,
                    explanation: "Readability score assesses how easy it is to read and understand the content.",
                    stars: calculateStars(readabilityScore > 60, readabilityScore > 70, 'medium'),
                    recommendation: readabilityScore > 60 ? "" : "Simplify your content to improve readability."
                },
                grammar: {
                    value: `${grammarScore} / 100`,
                    explanation: "Grammar score evaluates the grammatical accuracy of the content.",
                    stars: calculateStars(grammarScore > 90, grammarScore > 95, 'medium'),
                    recommendation: grammarScore > 90 ? "" : "Check your content for grammatical errors to improve quality."
                },
                uniqueness: {
                    value: `${uniquenessScore} / 100`,
                    explanation: "Uniqueness score measures how original your content is.",
                    stars: calculateStars(uniquenessScore > 80, uniquenessScore > 90, 'medium'),
                    recommendation: uniquenessScore > 80 ? "" : "Ensure your content is original and not copied from other sources."
                },
                keywordDensity: {
                    value: `${keywordDensityScore} / 100`,
                    explanation: "Keyword density score reflects the balance of keywords within your content.",
                    stars: calculateStars(keywordDensityScore == 100, keywordDensityScore >= 75, 'medium'),
                    recommendation: keywordDensityScore == 100 ? "" : "Adjust keyword density for optimal SEO performance."
                },
                sentiment: {
                    value: `${sentimentScore} / 100`,
                    explanation: "Sentiment score indicates the overall emotional tone of the content.",
                    stars: calculateStars(sentimentScore > 75, sentimentScore > 85, 'low'),
                    recommendation: sentimentScore > 75 ? "" : "Consider adjusting the emotional tone of your content."
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