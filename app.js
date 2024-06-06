const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://scholar.google.com/scholar';
const query = 'imed+abassi';
const maxPages = 2; 

const scrapePage = async (start) => {
  const url = `${baseUrl}?start=${start}&q=${query}&hl=en&as_sdt=0,5`;

  try {
    const response = await axios.get(url);
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

      if (title && link && pdfLink) {
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
  const allResults = [];
  for (let start = 0; start < maxPages * 10; start += 10) {
    const pageResults = await scrapePage(start);
    allResults.push(...pageResults);
  }

  const queryFilename = query.replace(/\+/g, '_') + '.json';
  fs.writeFileSync(queryFilename, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`Results saved to ${queryFilename}`);
};

scrapeAllPages();
