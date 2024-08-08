// Form submission event listener
document.getElementById('submissionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const image = document.getElementById('image').files[0];

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDXzyHOuZvDORubiwNtrZUo3cVnBYT288s",
        authDomain: "mitzvahmerch-ac346.firebaseapp.com",
        projectId: "mitzvahmerch-ac346",
        storageBucket: "mitzvahmerch-ac346.appspot.com",
        messagingSenderId: "232131426361",
        appId: "1:232131426361:web:8c7852a8da0e2f7a8d35e8",
        measurementId: "G-XXFM5DPRZ6"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Upload image to Firebase Storage and get the URL
    const storageRef = storage.ref('images/' + image.name);
    const uploadTask = storageRef.put(image);

    uploadTask.on('state_changed', 
        (snapshot) => {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
            // Handle error
            console.error('Upload failed', error);
            document.getElementById('error-message').style.display = 'block';
        }, 
        async () => {
            // Handle successful uploads on complete
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            console.log('File available at', downloadURL);

            // Save data to Firestore
            try {
                const docRef = await db.collection('submissions').add({
                    name: name,
                    email: email,
                    date: date,
                    imageUrl: downloadURL
                });
                console.log("Document written with ID: ", docRef.id);
                document.getElementById('feedback-message').style.display = 'block';
                // Clear the form
                document.getElementById('submissionForm').reset();
                document.getElementById('file-name').textContent = '';
                // Close the modal
                document.getElementById('uploadModal').style.display = 'none';
            } catch (error) {
                console.error('Error saving document: ', error);
                document.getElementById('error-message').style.display = 'block';
            }
        }
    );
});


