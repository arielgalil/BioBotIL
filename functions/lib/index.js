"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onActivityCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// Pricing constants from config.ts equivalent
const PRICING = {
    'gemini-2.5-flash-lite-preview-09-2025': { input: 0.000000075, output: 0.0000003 }
};
exports.onActivityCreated = (0, firestore_1.onDocumentCreated)("activity_logs/{logId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const { type, userId, model, inputTokens, outputTokens } = data;
    const statsRef = db.doc("stats/global");
    const userRef = db.doc(`users/${userId}`);
    const billingRef = db.doc("config/billing");
    const batch = db.batch();
    // 1. Update Global Stats
    if (type === 'session_start') {
        batch.set(statsRef, { totalUsers: admin.firestore.FieldValue.increment(1) }, { merge: true });
        batch.set(userRef, { firstSeen: admin.firestore.FieldValue.serverTimestamp(), lastActive: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    else if (type === 'message_sent') {
        batch.update(statsRef, { totalMessagesSent: admin.firestore.FieldValue.increment(1) });
        batch.set(userRef, { messagesSent: admin.firestore.FieldValue.increment(1), lastActive: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    else if (type === 'message_received') {
        batch.update(statsRef, { totalMessagesReceived: admin.firestore.FieldValue.increment(1) });
        batch.set(userRef, { messagesReceived: admin.firestore.FieldValue.increment(1), lastActive: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        // 2. Update Billing if tokens are present
        if (model && inputTokens >= 0 && outputTokens >= 0) {
            const pricing = PRICING[model];
            if (pricing) {
                const cost = (inputTokens * pricing.input) + (outputTokens * pricing.output);
                if (cost > 0) {
                    batch.update(billingRef, { currentCost: admin.firestore.FieldValue.increment(cost) });
                }
            }
        }
    }
    try {
        await batch.commit();
    }
    catch (error) {
        console.error(`Error processing activity log ${event.id}:`, error);
    }
});
//# sourceMappingURL=index.js.map