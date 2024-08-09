import firebase_admin
from firebase_admin import credentials, firestore

# Path to your service account key file
cred = credentials.Certificate('/Users/aaronmichaels/WriteOcassio/ServiceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'projectId': 'mitzvahmerch-ac346',
})

# Firestore interaction code
db = firestore.client()

# Attempt to get all documents from the 'users' collection
try:
    docs = db.collection('users').get()
    if docs:
        for doc in docs:
            print(f'Document ID: {doc.id} => Data: {doc.to_dict()}')
    else:
        print('No documents found in the users collection.')
except Exception as e:
    print(f'An error occurred: {e}')
