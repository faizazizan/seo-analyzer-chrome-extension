// N-Gram Analyzer Content Script
// Extracts and analyzes webpage content

(function () {
    'use strict';

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'analyze') {
            const analysis = analyzePageContent();
            sendResponse(analysis);
        }
        return true;
    });

    function analyzePageContent() {
        // Extract visible text
        const text = extractVisibleText();

        // Normalize and tokenize
        const normalizedText = normalizeText(text);
        const tokens = tokenize(normalizedText);

        // Generate n-grams
        const nGrams = {
            '1': generateNGrams(tokens, 1),
            '2': generateNGrams(tokens, 2),
            '3': generateNGrams(tokens, 3),
            '4': generateNGrams(tokens, 4),
            '5': generateNGrams(tokens, 5)
        };

        // Calculate metrics
        const totalWords = tokens.length;
        const nGramMetrics = calculateNGramMetrics(nGrams, totalWords);

        // SEO metrics
        const seoMetrics = calculateSEOMetrics(text, tokens);

        // Detect issues
        const issues = detectIssues(nGramMetrics, seoMetrics);

        return {
            nGramMetrics,
            seoMetrics,
            issues,
            totalWords
        };
    }

    function extractVisibleText() {
        // Clone the body to avoid modifying the actual page
        const clone = document.body.cloneNode(true);

        // Remove script, style, and hidden elements
        const elementsToRemove = clone.querySelectorAll('script, style, noscript, iframe');
        elementsToRemove.forEach(el => el.remove());

        // Get text content
        let text = clone.innerText || clone.textContent || '';

        return text;
    }

    function normalizeText(text) {
        // Convert to lowercase
        text = text.toLowerCase();

        // Remove special characters except alphanumeric, hyphens, apostrophes, and spaces
        text = text.replace(/[^a-z0-9\s'\-]/g, ' ');

        // Replace multiple spaces with single space
        text = text.replace(/\s+/g, ' ');

        // Trim
        text = text.trim();

        return text;
    }

    function tokenize(text) {
        // Split by whitespace and filter empty strings
        const tokens = text.split(/\s+/).filter(word => word.length > 0);
        return tokens;
    }

    function generateNGrams(tokens, n) {
        const nGrams = {};

        if (tokens.length < n) {
            return nGrams;
        }

        for (let i = 0; i <= tokens.length - n; i++) {
            const gram = tokens.slice(i, i + n).join(' ');
            nGrams[gram] = (nGrams[gram] || 0) + 1;
        }

        return nGrams;
    }

    function calculateNGramMetrics(nGrams, totalWords) {
        const metrics = {};

        for (const [size, grams] of Object.entries(nGrams)) {
            const gramsArray = [];

            for (const [phrase, count] of Object.entries(grams)) {
                const density = (count / totalWords) * 100;
                const share = count / totalWords;

                gramsArray.push({
                    phrase,
                    count,
                    density: parseFloat(density.toFixed(2)),
                    share: parseFloat(share.toFixed(4))
                });
            }

            // Sort by count (descending)
            gramsArray.sort((a, b) => b.count - a.count);

            metrics[size] = gramsArray;
        }

        return metrics;
    }

    function calculateSEOMetrics(originalText, tokens) {
        const metrics = {};

        // Total words
        metrics.totalWords = tokens.length;

        // Count sentences
        const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        metrics.totalSentences = sentences.length;

        // Average sentence length
        if (sentences.length > 0) {
            const sentenceLengths = sentences.map(s => {
                const words = s.trim().split(/\s+/).filter(w => w.length > 0);
                return words.length;
            });
            const totalSentenceWords = sentenceLengths.reduce((sum, len) => sum + len, 0);
            metrics.avgSentenceLength = parseFloat((totalSentenceWords / sentences.length).toFixed(2));
            metrics.sentenceLengths = sentenceLengths;
        } else {
            metrics.avgSentenceLength = 0;
            metrics.sentenceLengths = [];
        }

        // Count paragraphs
        const paragraphs = document.querySelectorAll('p');
        const paragraphTexts = Array.from(paragraphs).map(p => p.innerText || p.textContent).filter(t => t.trim().length > 0);
        metrics.totalParagraphs = paragraphTexts.length;

        // Average paragraph length
        if (paragraphTexts.length > 0) {
            const paragraphLengths = paragraphTexts.map(p => {
                const words = p.trim().split(/\s+/).filter(w => w.length > 0);
                return words.length;
            });
            const totalParagraphWords = paragraphLengths.reduce((sum, len) => sum + len, 0);
            metrics.avgParagraphLength = parseFloat((totalParagraphWords / paragraphTexts.length).toFixed(2));
            metrics.paragraphLengths = paragraphLengths;
        } else {
            metrics.avgParagraphLength = 0;
            metrics.paragraphLengths = [];
        }

        // Count HTML elements
        metrics.h1Count = document.querySelectorAll('h1').length;
        metrics.h2Count = document.querySelectorAll('h2').length;
        metrics.h3Count = document.querySelectorAll('h3').length;
        metrics.strongCount = document.querySelectorAll('strong, b').length;

        // Count links
        const links = document.querySelectorAll('a[href]');
        metrics.totalLinks = links.length;

        const currentDomain = window.location.hostname;
        let internalLinks = 0;
        let externalLinks = 0;

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                try {
                    // Handle relative URLs
                    if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
                        internalLinks++;
                    } else if (href.startsWith('http://') || href.startsWith('https://')) {
                        const linkUrl = new URL(href);
                        if (linkUrl.hostname === currentDomain) {
                            internalLinks++;
                        } else {
                            externalLinks++;
                        }
                    } else {
                        // Relative path
                        internalLinks++;
                    }
                } catch (e) {
                    // If URL parsing fails, assume internal
                    internalLinks++;
                }
            }
        });

        metrics.internalLinks = internalLinks;
        metrics.externalLinks = externalLinks;

        return metrics;
    }

    function detectIssues(nGramMetrics, seoMetrics) {
        const issues = {
            keywordStuffing: [],
            longSentences: 0,
            longParagraphs: 0
        };

        // Check for keyword stuffing (any n-gram > 5% density)
        for (const [size, grams] of Object.entries(nGramMetrics)) {
            grams.forEach(gram => {
                if (gram.density > 5) {
                    issues.keywordStuffing.push({
                        phrase: gram.phrase,
                        density: gram.density,
                        size: size
                    });
                }
            });
        }

        // Check for long sentences (> 25 words)
        if (seoMetrics.sentenceLengths) {
            issues.longSentences = seoMetrics.sentenceLengths.filter(len => len > 25).length;
        }

        // Check for long paragraphs (> 120 words)
        if (seoMetrics.paragraphLengths) {
            issues.longParagraphs = seoMetrics.paragraphLengths.filter(len => len > 120).length;
        }

        return issues;
    }
})();
