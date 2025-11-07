# Items and Borrow Request System Setup

This document explains the implementation of the Add Item feature with image upload and the integrated borrow request system using Firebase Firestore.

## Features Implemented

### 1. Add Item Feature

- **Add Item Button** in My Items page
- **AddItemModal Component** with comprehensive form
- **Image Upload** with preview functionality
- **Firebase Storage** integration for images
- **Real-time updates** using Firestore subscriptions

### 2. Borrow Request System

- **Create borrow requests** from Catalog page
- **Accept/Decline requests** in My Items page
- **Real-time notifications** for new requests
- **User-specific tracking** with Clerk authentication

## Firebase Collections Structure

### Items Collection (`items`)

```javascript
{
  id: "auto-generated",
  ownerId: "clerk-user-id",
  ownerName: "User Full Name",
  name: "Item Name",
  category: "Tools|Kitchen|Sports|etc",
  description: "Item description",
  imageUrl: "firebase-storage-url",
  availability: true|false,
  dailyRate: 0,
  deposit: 0,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Borrow Requests Collection (`borrowRequests`)

```javascript
{
  id: "auto-generated",
  itemId: "item-id",
  itemName: "Item Name",
  ownerId: "owner-clerk-id",
  ownerName: "Owner Name",
  borrowerId: "borrower-clerk-id",
  borrowerName: "Borrower Name",
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD",
  status: "pending|accepted|declined",
  timestamp: timestamp
}
```

## Files Created

### Services

1. **src/services/itemService.js**

   - `addItem(itemData, imageFile)` - Add new item with image
   - `updateItem(itemId, updates, newImageFile)` - Update item
   - `deleteItem(itemId, imageUrl)` - Delete item and image
   - `getAllItems()` - Get all items
   - `getItemsByOwner(ownerId)` - Get user's items
   - `subscribeToItems(callback)` - Real-time all items
   - `subscribeToItemsByOwner(ownerId, callback)` - Real-time user items
   - `toggleItemAvailability(itemId, currentAvailability)` - Toggle availability

2. **src/services/borrowService.js**
   - `createBorrowRequest(requestData)` - Create new request
   - `updateBorrowRequestStatus(requestId, status)` - Accept/decline
   - `deleteBorrowRequest(requestId)` - Delete request
   - `getBorrowRequestsByOwner(ownerId)` - Get requests for owner
   - `getBorrowRequestsByBorrower(borrowerId)` - Get user's requests
   - `subscribeToBorrowRequestsByOwner(ownerId, callback)` - Real-time owner requests
   - `subscribeToBorrowRequestsByBorrower(borrowerId, callback)` - Real-time borrower requests

### Components

3. **src/components/AddItemModal.jsx**
   - Form with image upload
   - Image preview functionality
   - Validation for all fields
   - Category dropdown
   - Daily rate and deposit inputs
   - Availability toggle

### Updated Files

4. **src/services/firebase.js**

   - Added Firebase Storage import and initialization

5. **src/pages/MyItems.jsx**

   - Integrated AddItemModal
   - Real-time item subscription
   - Real-time borrow request subscription
   - Add, delete, and toggle availability functions
   - Accept/decline borrow requests

6. **src/pages/Catalog.jsx**

   - Real-time items subscription
   - Integrated borrow request creation
   - Hide borrow button for own items
   - Show "Your Item" badge for owned items

7. **src/components/ItemCard.jsx**

   - Display uploaded images
   - Show availability status
   - Disable borrow button for unavailable items
   - Hide chat/borrow for own items

8. **src/App.css**
   - Styles for AddItemModal
   - Image upload and preview styles
   - Item card with image styles
   - Availability badge styles
   - Status badge styles
   - Responsive design updates

## How to Use

### Adding an Item

1. Navigate to **My Items** page
2. Click **"+ Add Item"** button
3. Fill in the form:
   - Upload an image (optional, max 5MB)
   - Enter item name (required)
   - Select category (required)
   - Add description (required)
   - Set daily rate (optional, 0 for free)
   - Set security deposit (optional)
   - Toggle availability
4. Click **"Add Item"**
5. Item appears immediately in your list

### Managing Items

- **Toggle Availability**: Click the availability badge on your item
- **Delete Item**: Click the "Delete" button (confirms before deleting)
- Items update in real-time across all users

### Borrowing Items

1. Navigate to **Catalog** page
2. Browse available items
3. Click **"Borrow"** on desired item
4. Select start and end dates
5. Click **"Send Borrow Request"**
6. Owner receives notification in My Items page

### Managing Borrow Requests (Owner)

1. Navigate to **My Items** page
2. Scroll to **"Borrow Requests"** section
3. View pending requests with borrower details
4. Click **"Accept"** or **"Decline"**
5. Status updates in real-time

## Firebase Storage Rules

For development, use these rules (update for production):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /items/{imageId} {
      // Allow authenticated users to upload
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');

      // Allow anyone to read
      allow read: if true;
    }
  }
}
```

## Firestore Security Rules

For development (test mode):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && resource.data.ownerId == request.auth.uid;
    }

    match /borrowRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
                    && (resource.data.ownerId == request.auth.uid
                        || resource.data.borrowerId == request.auth.uid);
      allow delete: if request.auth != null
                    && (resource.data.ownerId == request.auth.uid
                        || resource.data.borrowerId == request.auth.uid);
    }
  }
}
```

## Testing Checklist

### Add Item Feature

- [ ] Click "Add Item" button opens modal
- [ ] Upload image shows preview
- [ ] Remove image works correctly
- [ ] Form validation works (required fields)
- [ ] Item appears immediately after adding
- [ ] Image displays correctly in item card
- [ ] Items persist after page refresh

### Item Management

- [ ] Toggle availability updates status
- [ ] Delete item removes from list
- [ ] Delete also removes image from storage
- [ ] Real-time updates work across tabs

### Borrow Requests

- [ ] Can create borrow request from Catalog
- [ ] Request appears in owner's My Items page
- [ ] Accept/Decline updates status
- [ ] Status changes reflect in real-time
- [ ] Cannot borrow own items
- [ ] Cannot borrow unavailable items

### User Experience

- [ ] Loading states display correctly
- [ ] Error messages show for failures
- [ ] Success toasts appear for actions
- [ ] Responsive design works on mobile
- [ ] Images load and display properly

## Troubleshooting

### Images Not Uploading

- Check Firebase Storage is enabled
- Verify storage rules allow writes
- Check file size (max 5MB)
- Ensure file is an image type

### Items Not Appearing

- Check Firestore rules allow reads
- Verify user is authenticated
- Check browser console for errors
- Ensure Firebase config is correct

### Borrow Requests Not Working

- Verify both users are authenticated
- Check Firestore rules for borrowRequests
- Ensure itemId and ownerId are correct
- Check network tab for API errors

## Next Steps

### Recommended Enhancements

1. Add item editing functionality
2. Implement item search and filters
3. Add notification system for requests
4. Create borrowing history page
5. Add item ratings and reviews
6. Implement calendar for availability
7. Add multiple image upload
8. Create item categories with icons

### Production Considerations

1. Update Firestore security rules
2. Update Storage security rules
3. Add image optimization
4. Implement proper error handling
5. Add analytics tracking
6. Set up backup strategy
7. Add rate limiting
8. Implement data validation

## Support

For issues or questions:

1. Check browser console for errors
2. Verify Firebase configuration
3. Review Firestore and Storage rules
4. Check authentication status
5. Test with different user accounts
