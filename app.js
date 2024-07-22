const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const RateLimit = require('axios-rate-limit');

const baseUrl = 'https://scholar.google.com/scholar';
const query = process.argv[2] ;

// Create an instance of axios with rate limiting
const http = RateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000 });

const scrapePage = async (start) => {
  const url = `${baseUrl}?start=${start}&q=${query}&hl=en&as_sdt=0,5`;

  try {
    const response = await http.get(url, { timeout: 10000 }); // Timeout after 10 seconds
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('.gs_r.gs_or.gs_scl').each((index, element) => {
      const titleElement = $(element).find('.gs_rt a');
      const pdfElement = $(element).find('.gs_ggs .gs_or_ggsm a');
      const descriptionElement = $(element).find('.gs_rs');

      const title = descriptionElement.text().trim();
      const link = titleElement.attr('href');
      const pdfLink = pdfElement.attr('href');

      // Ignore results with pdf_url from https://www.academia.edu
      if (title && link && pdfLink && pdfLink.endsWith('.pdf') && !pdfLink.includes('https://www.academia.edu')) {
        results.push({
          title: title,
          url: link,
          pdf_url: pdfLink
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching the page:', error);
    return [];
  }
};

const scrapeAllPages = async () => {
  let allResults = [];
  let start = 0;
  
  // Continue scraping until we have 8 PDF links or no more results
  while (allResults.length < 8) {
    const pageResults = await scrapePage(start);
    if (pageResults.length === 0) break; // No more results
    allResults.push(...pageResults);
    start += 10;
  }

  const queryFilename = query.replace(/\+/g, '_') + '.json';
  fs.writeFileSync(queryFilename, JSON.stringify(allResults.slice(0, 8), null, 2), 'utf-8');
  console.log(`Results saved to ${queryFilename}`);
};

scrapeAllPages();
