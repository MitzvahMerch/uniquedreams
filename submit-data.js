import { db, storage } from './firebase-config';
import { collection, addDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Function to submit data
async function submitData(name, email, date, imageUrl) {
  try {
    const docRef = await addDoc(collection(db, "submissions"), {
      name: name,
      email: email,
      date: date,
      imageUrl: imageUrl
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Form submission event listener
document.getElementById('submissionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const date = document.getElementById('date').value;
  const image = document.getElementById('image').files[0];

  // Upload image to Firebase Storage and get the URL
  const storageRef = ref(storage, 'images/' + image.name);
  await uploadBytes(storageRef, image);
  const imageUrl = await getDownloadURL(storageRef);

  // Submit data to Firestore
  submitData(name, email, date, imageUrl);
});
