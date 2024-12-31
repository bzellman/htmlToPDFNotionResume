#!/usr/bin/env node

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const AdmZip = require('adm-zip');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// CLI configuration
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    description: 'Input directory to watch',
    default: path.join(process.env.HOME, 'Downloads/RawHTML')
  })
  .option('output', {
    alias: 'o',
    description: 'Output directory for PDFs',
    default: path.join(process.env.HOME, 'ActiveResumes')
  })
  .help()
  .alias('help', 'h')
  .argv;

async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const absoluteHtmlPath = path.resolve(htmlPath);

  await page.goto(`file://${absoluteHtmlPath}`, {
    waitUntil: ['load', 'networkidle0'],
    timeout: 30000
  });

  // Inject CSS while preserving existing styles
  await page.evaluate(() => {

    
    // Add our print styles
    const pageStyle = document.createElement('style');
    pageStyle.textContent = `
      @page {
        size: letter;
        margin: 20 !important;
      }
      p {
        margin-top: 0em !important;
        margin-bottom: 0em !important;
      }
      .page-title {
        margin-bottom: 0.0em !important;
      }
      .page-description {
        margin: 0em !important;
      }
      .body {
        line-height: 1.0em !important;
      }
      ul {
        margin: 0;
        margin-block-start: 0.35em !important;
        margin-block-end: 0.35em !important;
      }
    `;
    document.head.insertBefore(pageStyle, document.head.firstChild);
    
    console.log('Updated styles:', document.head.innerHTML);
  });

  await page.pdf({
    path: outputPath,
    format: 'LETTER',
    printBackground: true,
    displayHeaderFooter: false,
    scale: 0.65,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });

  await browser.close();
}

async function processFile(inputPath, outputDir) {
  const ext = path.extname(inputPath).toLowerCase();
  const filename = path.basename(inputPath);

  if (ext === '.zip') {
    try {
      const zip = new AdmZip(inputPath);
      const zipEntries = zip.getEntries();
      
      for (const entry of zipEntries) {
        if (entry.entryName.toLowerCase().endsWith('.html')) {
          const tempDir = path.join(outputDir, '_temp');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          zip.extractEntryTo(entry, tempDir, false, true);
          const htmlPath = path.join(tempDir, entry.entryName);
          const pdfPath = path.join(outputDir, entry.entryName.replace('.html', '.pdf'));
          
          await convertHtmlToPdf(htmlPath, pdfPath);
          fs.rmSync(tempDir, { recursive: true });
        }
      }
    } catch (err) {
      console.error(`Error processing zip file ${filename}:`, err);
    }
  } else if (ext === '.html') {
    const outputPath = path.join(outputDir, filename.replace('.html', '.pdf'));
    await convertHtmlToPdf(inputPath, outputPath);
  } else {
    console.log(`Ignoring file ${filename} - not an HTML or ZIP file`);
  }
}

function watchDirectory(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Watching ${inputDir} for HTML and ZIP files...`);
  
  fs.watch(inputDir, (eventType, filename) => {
    if (!filename) return;
    
    // Only process on 'rename' (add) or 'change' events
    if (eventType === 'rename' || eventType === 'change') {
      const inputPath = path.join(inputDir, filename);
      
      // Check if file exists (to filter out delete events)
      if (fs.existsSync(inputPath)) {
        const ext = path.extname(filename).toLowerCase();
        if (ext === '.html' || ext === '.zip') {
          console.log(`Processing ${filename}...`);
          processFile(inputPath, outputDir)
            .then(() => console.log(`Finished processing ${filename}`))
            .catch(err => console.error(`Error processing ${filename}:`, err));
        }
      }
    }
  });
}

// Command line usage
if (require.main === module) {
  watchDirectory(argv.input, argv.output);
}
