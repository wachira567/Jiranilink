# Firestore Index Setup Required

## Issue

The application is showing errors because Firestore requires composite indexes for queries that order by multiple fields.

## Error Messages

You're seeing errors like:

```
The query requires an index. You can create it here: [URL]
```

## Quick Fix - Create Indexes

### Option 1: Click the Links (Easiest)

Firebase provides direct links to create the indexes. Click these links from your browser console:

1. **Items Index:**

   - Click the link in the console error for `items` collection
   - It will open Firebase Console
   - Click "Create Index"
   - Wait 2-5 minutes for index to build

2. **Borrow Requests Index:**
   - Click the link in the console error for `borrowRequests` collection
   - Click "Create Index"
   - Wait 2-5 minutes for index to build

### Option 2: Manual Creation

Go to Firebase Console → Firestore → Indexes → Create Index

**Index 1: Items Collection**

- Collection ID: `items`
- Fields to index:
  1. `ownerId` - Ascending
  2. `createdAt` - Descending
- Query scope: Collection

**Index 2: Borrow Requests Collection**

- Collection ID: `borrowRequests`
- Fields to index:
  1. `ownerId` - Ascending
  2. `timestamp` - Descending
- Query scope: Collection

### Option 3: Use Firebase CLI

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "ownerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "borrowRequests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "ownerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:

```bash
firebase deploy --only firestore:indexes
```

## Temporary Workaround

While indexes are building, the app will show loading states. The indexes typically take 2-5 minutes to build.

## Why This Happens

Firestore requires indexes for queries that:

1. Filter by one field (e.g., `ownerId`)
2. AND order by another field (e.g., `createdAt`)

This is a security and performance feature to ensure queries are efficient.

## After Creating Indexes

1. Wait for indexes to show "Enabled" status in Firebase Console
2. Refresh your application
3. The errors should disappear
4. Data will load correctly

## Verification

Once indexes are created:

- My Items page will load your items
- Borrow requests will appear
- No more console errors
- Real-time updates will work

## Note

This is a one-time setup. Once indexes are created, they persist and work for all users.
