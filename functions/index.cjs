const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require('path');
const os = require('os');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { exec } = require('child_process');
const sharp = require('sharp');
const cors = require('cors')({ origin: true }); // Import and configure CORS

admin.initializeApp();

const firestore = admin.firestore();

exports.convertAndProcessLogo = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const bucket = admin.storage().bucket();

  let convertedFilePath = tempFilePath;

  try {
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log("File downloaded locally to", tempFilePath);

    const fileExt = path.extname(filePath).toLowerCase();

    if (fileExt === '.pdf') {
      console.log("Processing PDF...");
      convertedFilePath = path.join(os.tmpdir(), fileName.replace(fileExt, '.png'));
      await convertPdfToImage(tempFilePath, convertedFilePath);
      console.log("PDF file converted to PNG");
    } else if (fileExt === '.ai') {
      console.log("Processing AI file...");
      convertedFilePath = path.join(os.tmpdir(), fileName.replace(fileExt, '.png'));
      await convertAiToImage(tempFilePath, convertedFilePath);
      console.log("AI file converted to PNG");
    } else if (fileExt === '.webp') {
      convertedFilePath = path.join(os.tmpdir(), fileName.replace(fileExt, '.png'));
      await sharp(tempFilePath).png().toFile(convertedFilePath);
      console.log(`${fileExt} file converted to PNG`);
    }

    const img = await loadImage(convertedFilePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const colorSet = new Set();

    const binSize = 32;
    const tolerance = 100;  // Using previous tolerance

    for (let i = 0; i < imageData.data.length; i += 4) {
      let r = imageData.data[i];
      let g = imageData.data[i + 1];
      let b = imageData.data[i + 2];

      // Apply binning
      r = Math.round(r / binSize) * binSize;
      g = Math.round(g / binSize) * binSize;
      b = Math.round(b / binSize) * binSize;

      let isSimilarColorFound = false;

      // Check for similar colors within the tolerance
      for (let existingColor of colorSet) {
        const [rExisting, gExisting, bExisting] = existingColor.split(',').map(Number);

        if (Math.abs(r - rExisting) <= tolerance &&
            Math.abs(g - gExisting) <= tolerance &&
            Math.abs(b - bExisting) <= tolerance) {
          isSimilarColorFound = true;
          break;
        }
      }

      // Add the color if no similar color is found
      if (!isSimilarColorFound) {
        colorSet.add(`${r},${g},${b}`);
      }
    }

    // Step 1: Check if the image is a rectangle or square
    let backgroundColor = null;
    if (img.width === img.height || img.width !== img.height) {  // Rectangle or square check
      const edgeColors = [];

      // Step 2: Sample colors along all four edges
      const step = Math.floor(img.width / 10);  // Sample every 10% along the edges

      // Top and bottom edges
      for (let x = 0; x < img.width; x += step) {
        const topIdx = (x * 4);
        const bottomIdx = ((img.height - 1) * img.width + x) * 4;
        edgeColors.push(`${imageData.data[topIdx]},${imageData.data[topIdx + 1]},${imageData.data[topIdx + 2]}`);
        edgeColors.push(`${imageData.data[bottomIdx]},${imageData.data[bottomIdx + 1]},${imageData.data[bottomIdx + 2]}`);
      }

      // Left and right edges
      for (let y = 0; y < img.height; y += step) {
        const leftIdx = (y * img.width * 4);
        const rightIdx = (y * img.width * 4 + (img.width - 1) * 4);
        edgeColors.push(`${imageData.data[leftIdx]},${imageData.data[leftIdx + 1]},${imageData.data[leftIdx + 2]}`);
        edgeColors.push(`${imageData.data[rightIdx]},${imageData.data[rightIdx + 1]},${imageData.data[rightIdx + 2]}`);
      }

      // Step 3: Check if all edges have the same color
      const firstEdgeColor = edgeColors[0];
      const allEdgesSameColor = edgeColors.every(color => color === firstEdgeColor);

      if (allEdgesSameColor) {
        backgroundColor = firstEdgeColor;
      }
    }

    // Step 4: Exclude the background color if detected
    if (backgroundColor) {
      colorSet.delete(backgroundColor);
    }

    const numColors = colorSet.size;
    console.log(`Number of colors detected (excluding background): ${numColors}`);

    // Retrieve sessionId from metadata
    const sessionId = object.metadata.sessionId || "unknown";

    // Store in Firestore using sessionId as the document ID
    await firestore.collection("logos").doc(sessionId).update({
      numColors: numColors,
      timestamp: new Date().toISOString()
    });  

    console.log("Color information stored successfully in Firestore with session ID:", sessionId);
  } catch (error) {
    console.error("Error processing the logo:", error);
  } finally {
    fs.unlinkSync(tempFilePath);
    if (tempFilePath !== convertedFilePath) {
      fs.unlinkSync(convertedFilePath);
    }
  }

  return null;
});

function convertPdfToImage(pdfPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `magick -density 300 "${pdfPath}[0]" -quality 100 "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during conversion: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(outputPath);
    });
  });
}

function convertAiToImage(aiPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `magick -density 300 "${aiPath}[0]" -quality 100 "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during conversion: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(outputPath);
    });
  });
}

// New Cloud Function to calculate price based on sessionId, quantity, and SKU
exports.calculatePrice = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
      const { sessionId, quantity, sku } = req.query;

      if (!sessionId || !quantity || !sku) {
          res.status(400).send('Missing sessionId, quantity, or SKU');
          return;
      }

      try {
          // Retrieve numColors from the logos collection using the sessionId
          const logoDoc = await firestore.collection("logos").doc(sessionId).get();
          if (!logoDoc.exists) {
              res.status(404).send('Session not found');
              return;
          }

          const numColors = logoDoc.data().numColors;

          // Retrieve pricing chart from the pricing collection using the SKU
          const pricingDoc = await firestore.collection("pricing").doc(sku).get();
          if (!pricingDoc.exists) {
              res.status(404).send('SKU not found');
              return;
          }

          const pricingChart = pricingDoc.data().pricingChart;

          // Determine the price based on numColors and quantity
          const quantityRange = Object.keys(pricingChart[numColors]).find(range => {
              const [min, max] = range.split('-').map(Number);
              return quantity >= min && quantity <= max;
          });

          const pricePerItem = pricingChart[numColors][quantityRange];

          // Calculate total price
          const totalPrice = pricePerItem * quantity;

          // Send the total price back to the client
          res.status(200).send({ price: totalPrice });
      } catch (error) {
          console.error("Error calculating price:", error);
          res.status(500).send('Internal Server Error');
      }
  });
});

// Add PayPal Fastlane Integration

const express = require('express');
const mustacheExpress = require('mustache-express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Disable ESLint's no-undef rule for the following block
/* eslint-disable no-undef */

const app = express();

// Set up Mustache as the template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Serve the checkout page
app.get('/checkout', (req, res) => {
    res.render('checkout', {
        clientId: process.env.PAYPAL_CLIENT_ID,
        domains: process.env.DOMAINS
    });
});

/* eslint-enable no-undef */
