const express = require('express');
const { JSDOM } = require('jsdom');
const cors = require('cors');
const app = express();
const port = 3000;

function isNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

// Enable CORS for all routes
app.use(cors());
app.options('*', cors()); // Preflight request handler

// Scraping endpoint
app.get('/api/scrape', async (req, res) => {
  try {
    const url = 'https://en.wikipedia.org/wiki/2024_Summer_Olympics_medal_table';
    const response = await fetch(url);
    const html = await response.text();
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const tableData = [];
    
    // Select the medal table
    const rows = document.querySelectorAll('table.wikitable tbody tr');
    for (let i = 1; i < rows.length - 1; i++) {
        const rowData = rows[i].querySelectorAll('td, th');
        let startidx = -1;
        if (isNumber(rowData[0].textContent.trim()) || rowData[0].textContent.trim() === "–") {
            startidx = 0;
        }
        let country = rowData[startidx + 1].textContent.trim();
        if (country === "France*") {
            country = "France";
        }
        const gold = Number(rowData[startidx + 2].textContent.trim());
        const silver = Number(rowData[startidx + 3].textContent.trim());
        const bronze = Number(rowData[startidx + 4].textContent.trim());
        const total = gold + silver + bronze;
        const score = 3 * gold + 2 * silver + bronze;           
        tableData.push({ country, gold, silver, bronze, total, score });
    }
    res.json({data: tableData});
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'An error occurred while scraping data' });
  }
});

module.exports = app;

