# LocalStorage Implementation Guide

## Overview

The application now uses **browser localStorage** instead of Firebase Firestore for storing items and borrow requests. This makes the app simpler, easier to deploy, and eliminates the need for backend configuration.

## How It Works

### Data Storage

- **Items**: Stored in `localStorage` under key `jiranilink_items`
- **Borrow Requests**: Stored in `localStorage` under key `jiranilink_borrow_requests`
- **Mock Data**: Automatically loaded on first visit from `src/data/mockData.json`

### Key Features

1. ✅ **No Backend Required** - Everything runs in the browser
2. ✅ **Instant Updates** - No network delays
3. ✅ **Easy Deployment** - Works on any static hosting
4. ✅ **User-Specific Data** - Items tied to Clerk user IDs
5. ✅ **Persistent Storage** - Data survives page refreshes
6. ✅ **Simple Management** - Easy to add, edit, delete items

## Files Structure

### Service Layer

**`src/services/localStorageService.js`**

- `getAllItems()` - Get all items
- `getItemsByOwner(ownerId)` - Get user's items
- `addItem(itemData, userId, userName)` - Add new item
- `updateItem(itemId, updates)` - Update item
- `deleteItem(itemId, userId)` - Delete item (owner only)
- `toggleItemAvailability(itemId, userId)` - Toggle availability
- `createBorrowRequest(requestData)` - Create borrow request
- `updateBorrowRequestStatus(requestId, status, userId)` - Accept/decline
- `getBorrowRequestsByOwner(ownerId)` - Get requests for owner
- `getBorrowRequestsByBorrower(borrowerId)` - Get user's requests

### Components

**`src/components/AddItemModal.jsx`**

- Simplified form without image upload
- Emoji selector for item icons
- All form fields with validation
- Toast notifications

**`src/pages/MyItems.jsx`**

- Display user's items
- Add new items
- Toggle availability
- Delete items (with confirmation)
- View and manage borrow requests
- Accept/decline requests

**`src/pages/Catalog.jsx`**

- Browse all items
- Search and filter
- Create borrow requests
- Pagination
- Hide own items from borrowing

## Data Structure

### Item Object

```javascript
{
  id: "1234567890", // Timestamp-based ID
  ownerId: "clerk_user_id",
  ownerName: "User Full Name",
  name: "Item Name",
  category: "Tools",
  description: "Item description",
  image: "🔧", // Emoji icon
  availability: true,
  dailyRate: 100,
  deposit: 500,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Borrow Request Object

```javascript
{
  id: "1234567890",
  itemId: "item_id",
  itemName: "Item Name",
  ownerId: "owner_clerk_id",
  ownerName: "Owner Name",
  borrowerId: "borrower_clerk_id",
  borrowerName: "Borrower Name",
  startDate: "2024-01-15",
  endDate: "2024-01-17",
  status: "pending", // pending, accepted, declined
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## Usage Guide

### Adding an Item

1. **Navigate to My Items** page
2. **Click "Add Item"** button
3. **Select an emoji** icon for your item
4. **Fill in the form:**
   - Item name (required)
   - Category (required)
   - Description (required)
   - Daily rate (optional, 0 for free)
   - Security deposit (optional)
   - Availability checkbox
5. **Click "Add Item"**
6. Item appears immediately in your list

### Managing Items

**Toggle Availability:**

- Click the availability badge on your item
- Changes between "Available" and "Unavailable"
- Updates instantly

**Delete Item:**

- Click "Delete" button
- Confirm deletion
- Item removed from storage
- Cannot be undone

### Borrowing Items

1. **Go to Catalog** page
2. **Browse or search** for items
3. **Click "Borrow"** on desired item
4. **Select dates** (start and end)
5. **Submit request**
6. Owner receives notification

### Managing Borrow Requests (Owner)

1. **Go to My Items** page
2. **Scroll to "Borrow Requests"** section
3. **View request details:**
   - Item name
   - Borrower name
   - Requested dates
   - Current status
4. **Click "Accept" or "Decline"**
5. Status updates immediately

## Advantages

### 1. Simplicity

- No Firebase configuration needed
- No indexes to create
- No backend deployment
- No API keys to manage

### 2. Performance

- Instant data access
- No network latency
- No loading delays
- Immediate updates

### 3. Deployment

- Works on any static host
- GitHub Pages
- Netlify
- Vercel
- Any CDN

### 4. Development

- Easy to test locally
- No external dependencies
- Simple debugging
- Clear data structure

## Limitations

### 1. Data Persistence

- **Browser-specific**: Data stored per browser
- **Not synced**: Different browsers = different data
- **Can be cleared**: User can clear browser data
- **No backup**: Data lost if localStorage cleared

### 2. Sharing

- **Single device**: Data doesn't sync across devices
- **No real-time**: Changes don't appear on other devices
- **Local only**: Each user sees their own data

### 3. Storage Limits

- **5-10MB limit**: Browser localStorage limit
- **No images**: Can't store actual image files
- **Text only**: Only text data (emojis work)

## Best Practices

### 1. Data Management

```javascript
// Always check if data exists
const items = getAllItems();
if (items.length === 0) {
  // Initialize with mock data
  initializeWithMockData(mockData);
}
```

### 2. Error Handling

```javascript
try {
  addItem(itemData, userId, userName);
  toast.success("Item added!");
} catch (error) {
  console.error(error);
  toast.error("Failed to add item");
}
```

### 3. User Validation

```javascript
// Always verify user owns the item
if (item.ownerId !== userId) {
  throw new Error("You can only modify your own items");
}
```

## Utility Functions

### Export Data (Backup)

```javascript
import { exportData } from "../services/localStorageService";

const backup = exportData();
console.log(backup);
// Download as JSON file
const blob = new Blob([JSON.stringify(backup, null, 2)], {
  type: "application/json",
});
const url = URL.createObjectURL(blob);
// Create download link...
```

### Import Data (Restore)

```javascript
import { importData } from '../services/localStorageService';

const backupData = {
  items: [...],
  borrowRequests: [...]
};
importData(backupData);
```

### Clear All Data

```javascript
import { clearAllData } from "../services/localStorageService";

// Use with caution!
clearAllData();
```

## Migration from Firebase

If you want to switch back to Firebase later:

1. **Keep the service interface** the same
2. **Replace localStorage calls** with Firestore calls
3. **Update imports** in components
4. **Add async/await** for Firebase operations
5. **Handle loading states** for network requests

## Troubleshooting

### Items Not Appearing

- Check browser console for errors
- Verify user is authenticated
- Check localStorage in DevTools (Application tab)
- Try clearing localStorage and refreshing

### Can't Add Items

- Ensure user is signed in
- Check form validation
- Verify all required fields filled
- Check browser console for errors

### Borrow Requests Not Working

- Verify both users are authenticated
- Check itemId and ownerId are correct
- Ensure item exists in localStorage
- Check request status

### Data Lost After Refresh

- Check if localStorage is enabled
- Verify browser isn't in incognito mode
- Check if browser cleared data
- Look for JavaScript errors

## Testing

### Manual Testing Checklist

- [ ] Add item with all fields
- [ ] Add item with minimal fields
- [ ] Toggle item availability
- [ ] Delete own item
- [ ] Try to delete others' items (should fail)
- [ ] Create borrow request
- [ ] Accept borrow request
- [ ] Decline borrow request
- [ ] Search and filter items
- [ ] Pagination works
- [ ] Data persists after refresh

### Browser DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Select **Local Storage**
4. View `jiranilink_items` and `jiranilink_borrow_requests`
5. Inspect data structure
6. Manually edit if needed

## Future Enhancements

### Possible Improvements

1. **IndexedDB**: For larger storage capacity
2. **Cloud Sync**: Optional Firebase sync
3. **Export/Import**: Backup and restore features
4. **Image Support**: Base64 encoded images
5. **Offline Mode**: Service worker for PWA
6. **Data Compression**: Reduce storage size
7. **Encryption**: Secure sensitive data
8. **Multi-tab Sync**: Sync across browser tabs

## Support

For issues:

1. Check browser console
2. Verify localStorage is enabled
3. Test in different browser
4. Clear localStorage and retry
5. Check authentication status

## Conclusion

The localStorage implementation provides a simple, fast, and reliable way to manage items and borrow requests without requiring a backend. It's perfect for:

- **Prototypes and MVPs**
- **Local development**
- **Simple deployments**
- **Learning projects**

For production apps with multiple users across devices, consider migrating to Firebase or another backend solution.
