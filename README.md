# JiraniLink: Empowering Communities Through Sharing

JiraniLink is a modern, community-driven platform designed to connect neighbors, reduce waste, and build trust through the sharing of tools, equipment, and everyday items. Built with modern web technologies, this application allows users to browse available items within their specific region, make secure borrow requests, and communicate seamlessly with trusted neighbors.

## Societal Impact: Building a Better World, Locally

In today's fast-paced world, people often buy expensive items (like power tools, ladders, or camping gear) that they only use once, while their next-door neighbor might have the exact same item sitting idle. JiraniLink makes society better by:
- **Promoting Sustainability**: Reducing overconsumption and minimizing environmental waste by maximizing the utility of existing products.
- **Fostering Community Trust**: Encouraging real-world interactions and building stronger, more resilient neighborhood bonds.
- **Economic Empowerment**: Saving households money by eliminating the need to purchase rarely used items.
- **Micro-Local Governance**: Empowering community leaders to moderate their specific region, ensuring a safe and reliable sharing environment.

## Key Features

- **Regional Isolation**: Items and requests are filtered by community region, ensuring you only interact with people nearby.
- **Interactive Community Map**: Discover what's available around you with a built-in map featuring privacy-preserving geolocation pins.
- **Real-Time Private Chat**: Secure 1-on-1 messaging between borrowers and lenders.
- **Admin Governance Dashboard**: A dedicated control center for regional leaders to monitor transactions, manage inventory, and enforce guidelines.
- **Rich Item Catalog & Search**: Find exactly what you need with category filtering and keyword search.
- **Custom Image Uploads**: Securely upload photos of your items or use built-in fallbacks.
- **Premium Glassmorphism UI**: A beautiful, responsive, modern dark-themed interface.

## Tech Stack

- **Frontend**: React 19, Vite, React Router DOM
- **Authentication**: Clerk
- **Database & Real-time Sync**: Firebase Firestore
- **Image Storage**: Cloudinary (Custom Uploads) & Firebase Storage
- **Mapping**: Mapbox GL JS (with Geolocation API)
- **Styling**: Vanilla CSS (Glassmorphism architecture)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd hackathon
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

- **Home Page**: Introduction to JiraniLink and its features
- **Catalog**: Browse and search for available items
- **My Items**: Manage your own items (future feature)
- **Profile**: View and edit your profile information

## Admin Configuration

JiraniLink uses Clerk's **Public Metadata** to assign administrative roles. To grant a user access to the Admin Dashboard:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/) and select your application.
2. In the left sidebar, click on **Users**.
3. Select the user you wish to authorize.
4. Scroll down to the **Public Metadata** section and click **Edit**.
5. Add the following JSON structure:
   ```json
   {
     "role": "admin"
   }
   ```
   *(To create a Global Admin, use `"super_admin"` instead of `"admin"`)*
6. Click **Save**. The user will see the "Admin" link in their navigation bar upon their next login.

## Project Structure

```
hackathon/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── BorrowRequestModal.jsx
│   │   ├── ItemCard.jsx
│   │   ├── Navbar.jsx
│   │   └── SearchBar.jsx
│   ├── data/
│   │   └── mockData.json
│   ├── pages/
│   │   ├── Catalog.jsx
│   │   ├── Home.jsx
│   │   ├── MyItems.jsx
│   │   └── Profile.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contributors

- Nelson
- Jeff
- Victor
- Lewis
- Mark

## License

This project is licensed under the MIT License.
