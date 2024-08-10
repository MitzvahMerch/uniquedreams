// Switching to 1st generation functions
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {createCanvas, loadImage} = require("canvas");

admin.initializeApp();

// Function to process the uploaded logo and count the number of colors
exports.processLogo = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const bucket = admin.storage().bucket();

  try {
    console.log("Attempting to download file from bucket:", filePath);
    const file = bucket.file(filePath);
    const [fileContent] = await file.download();
    console.log("File downloaded successfully");

    const img = await loadImage(fileContent);
    console.log("Image loaded successfully");

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

    const fileName = filePath.split("/").pop(); // Extracts the file name
    console.log("Storing color information in Firestore for:", fileName);

    await admin.firestore().collection("logos").doc(fileName).set({
      numColors: numColors,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Color information stored successfully in Firestore.");
  } catch (error) {
    console.error("Error processing the logo:", error);
  }

  return null;
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
