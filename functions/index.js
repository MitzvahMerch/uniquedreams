const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

exports.processLogo = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const bucket = admin.storage().bucket();

  let convertedFilePath = tempFilePath;

  try {
    // Download file from bucket
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log("File downloaded locally to", tempFilePath);

    const fileExt = path.extname(filePath).toLowerCase();

    // Convert file types if necessary
    if (fileExt === ".pdf" || fileExt === ".ai") {
      convertedFilePath = path.join(
        os.tmpdir(),
        fileName.replace(fileExt, ".png")
      );
      await sharp(tempFilePath).png().toFile(convertedFilePath);
      console.log(`${fileExt} file converted to PNG`);
    } else if (fileExt === ".webp") {
      convertedFilePath = path.join(
        os.tmpdir(),
        fileName.replace(fileExt, ".png")
      );
      await sharp(tempFilePath).png().toFile(convertedFilePath);
      console.log(`WEBP file converted to PNG`);
    }

    const img = await loadImage(convertedFilePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const colorSet = new Set();

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const rgb = `${r},${g},${b}`;
      colorSet.add(rgb);
    }

    const numColors = colorSet.size;
    console.log(`Number of colors detected: ${numColors}`);

    await admin.firestore().collection("logos").doc(fileName).set({
      numColors: numColors,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Color information stored successfully in Firestore.");
  } catch (error) {
    console.error("Error processing the logo:", error);
  } finally {
    fs.unlinkSync(tempFilePath); // Clean up the temp file
    if (tempFilePath !== convertedFilePath) {
      fs.unlinkSync(convertedFilePath); // Clean up the converted file
    }
  }

  return null;
});

/**
 * Converts a buffer to a PNG image using ImageMagick.
 *
 * @param {Buffer} buffer - The buffer containing the image data.
 * @return {Promise<Buffer>} A promise that resolves to a PNG buffer.
 */
async function convertToPng(buffer) {
  return new Promise((resolve, reject) => {
    exec(
      `magick convert -density 300 -quality 100 -background white -flatten - ${buffer}`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Error converting file: ${stderr}`));
        }
        resolve(Buffer.from(stdout));
      }
    );
  });
}
