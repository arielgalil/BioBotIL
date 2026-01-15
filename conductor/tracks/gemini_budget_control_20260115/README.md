# Billing Setup

To initialize the budget tracking system, follow these steps:

1.  **Firebase Configuration**: Ensure you have the following environment variables in your `.env.local`:
    *   `VITE_FIREBASE_API_KEY`
    *   `VITE_FIREBASE_AUTH_DOMAIN`
    *   `VITE_FIREBASE_PROJECT_ID`
    *   `VITE_FIREBASE_STORAGE_BUCKET`
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`
    *   `VITE_FIREBASE_APP_ID`

2.  **Run Setup Script**:
    Execute the following command to create the `config/billing` document in Firestore:
    ```bash
    npx tsx scripts/setup-billing.ts
    ```

3.  **Firestore Rules**: Ensure your Firestore rules allow the application to read and increment the `config/billing` document. Example:
    ```
    match /config/billing {
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['currentCost']) 
                    && request.resource.data.currentCost > resource.data.currentCost;
    }
    ```
