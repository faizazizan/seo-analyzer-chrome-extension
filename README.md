# N-Gram SEO Analyzer - Chrome Extension

A production-ready Chrome extension that performs comprehensive N-Gram analysis (1-5 grams) on webpage content with advanced SEO metrics. Built with vanilla JavaScript and Chrome Manifest V3.

## Features

### Core Analysis
- **N-Gram Generation**: Analyzes 1-gram through 5-gram patterns
- **Metrics Calculation**: Count, density (%), and share for each n-gram
- **Text Normalization**: Lowercase, special character removal, proper tokenization
- **Client-Side Processing**: All analysis runs locally without external APIs

### SEO Metrics
- Total word count
- Sentence analysis (count, average length)
- Paragraph analysis (count, average length)
- Link analysis (internal vs external)
- HTML element detection (H1, H2, H3, strong, anchor tags)

### Smart Alerts
- **Keyword Stuffing Detection**: Flags n-grams with >5% density
- **Long Sentence Warning**: Identifies sentences >25 words
- **Long Paragraph Warning**: Identifies paragraphs >120 words

### Modern UI
- Clean, professional design inspired by Ahrefs/SEMrush
- Collapsible sections for each n-gram size
- Sortable tables (by phrase, count, or density)
- Responsive layout that handles long phrases
- CSV export for all results

## Installation

1. **Download the Extension**
   - Navigate to `C:\Users\syede\.gemini\antigravity\scratch\ngram-analyzer-extension`

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `ngram-analyzer-extension` folder
   - The extension icon should appear in your toolbar

## Usage

1. **Navigate to Any Webpage**
   - Open any webpage you want to analyze

2. **Click the Extension Icon**
   - Click the N-Gram SEO Analyzer icon in your Chrome toolbar
   - The popup will open

3. **Analyze the Page**
   - Click the "Analyze Page" button
   - Wait for analysis to complete (usually 1-2 seconds)

4. **Review Results**
   - **Summary Section**: View overall content metrics
   - **Alerts**: Check for SEO issues (keyword stuffing, long sentences/paragraphs)
   - **N-Gram Sections**: Expand/collapse each n-gram size (1-5)
   - **Sort Tables**: Click column headers to sort by phrase, count, or density

5. **Export Data**
   - Click "Export CSV" to download all n-gram data
   - File includes all 1-5 gram results in a single CSV

## Technical Details

### Files
- `manifest.json` - Manifest V3 configuration
- `content.js` - Text extraction and analysis engine
- `popup.html` - User interface structure
- `popup.js` - UI logic and interactions
- `styles.css` - Modern styling
- `icon*.png` - Extension icons

### Permissions
- `activeTab` - Access current tab content
- `scripting` - Execute content scripts

### Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Edge 88+ (Chromium-based)

## How It Works

1. **Text Extraction**: Content script extracts visible text from the webpage, excluding `<script>`, `<style>`, and hidden elements

2. **Normalization**: Text is converted to lowercase, special characters removed (keeping alphanumeric, hyphens, apostrophes)

3. **Tokenization**: Text split into individual words

4. **N-Gram Generation**: Sliding window creates all possible n-grams for sizes 1-5

5. **Metrics Calculation**: For each n-gram:
   - Count: Number of occurrences
   - Density: (count / total words) × 100
   - Share: count / total words

6. **SEO Analysis**: Additional metrics calculated including sentence/paragraph analysis, link counting, and HTML element detection

7. **Display**: Results formatted and displayed in modern, sortable tables

## Example Use Cases

- **Content Optimization**: Identify overused phrases and keyword stuffing
- **SEO Audits**: Analyze content structure and keyword distribution
- **Competitor Analysis**: Study n-gram patterns on competitor pages
- **Content Writing**: Ensure proper keyword density and readability
- **Quality Assurance**: Check for overly long sentences/paragraphs

## Privacy

- All analysis is performed client-side
- No data is sent to external servers
- No tracking or analytics
- No external API calls

## Support

For issues or questions, please check:
- Ensure you're on a webpage with text content
- Refresh the page if analysis fails
- Check Chrome console for errors (F12)

---
**Version**: 1.0.0  
**License**: MIT  
**Author**: Built By [Faiz Azizan](https://faizazizan.com)
