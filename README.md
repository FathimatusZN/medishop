# Medishop – E-Commerce Platform for Medical Products #

Medishop is a full-stack web application that allows users to browse, purchase, and manage medical-related products efficiently. It includes features for both end-users and administrators, designed with scalability and usability in mind.

---

## Features ##

### 👥 User Features ###
- User registration and login with session-based role handling
- Browse products with category mapping
- Add to cart and checkout functionality
- View transaction history with invoice download
- Feedback system for completed orders
- Guestbook for user testimonials

### 🛒 Admin Features ###
- Admin dashboard with store summary (total users, products, income, etc.)
- Product management (CRUD with image upload)
- User management
- Transaction management (view/update order status)
- Report generation (with date filter, export to PDF/CSV)

---

## Technologies Used ##

- Frontend: Next.js 14 (App Router), React, Tailwind CSS 4
- Backend: Next.js API Routes (Node.js), PostgreSQL
- Styling & UI: Tailwind CSS
- Auth & Session: sessionStorage for role-based navigation
- PDF/CSV Generation: jspdf, papaparse, file-saver
- File Handling: Formidable for image uploads
- Email Notification: Nodemailer (for invoice sending)

---

## Project Structure (Simplified) ##

```
.next/
node_modules/
public/
├── products/             # Uploaded product images
├── *.svg, *.png          # App assets and icons

src/
├── app/
│   ├── (admin)/          # Admin pages: dashboard, reports, product mgmt
│   ├── (auth)/           # Auth pages: login, register
│   ├── (user)/           # User pages: cart, transactions, profile, etc.
│   ├── api/              # API endpoints
│   │   ├── auth/         # Login/register
│   │   ├── product/      # CRUD product APIs
│   │   ├── transaction/  # Order management
│   │   ├── report/       # Reporting endpoints
│   │   └── ...           # Other APIs (users, cart, guestbook, etc.)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/           # Reusable UI components
├── db/                   # Database connection/config
├── lib/                  # Utility functions
├── models/               # Database models (e.g., Product, User)
├── pages/api/            # Legacy or extended API (e.g., file upload, invoice)
│   ├── upload.js
│   ├── invoice.js
│   └── send-invoice.js
├── utils/                # Helpers (e.g., formatter, ID generator)

.env
.gitignore
eslint.config.mjs
jsconfig.json
next.config.mjs
package.json
postcss.config.js
tailwind.config.js
README.md
```

---

# Getting Started #

1. Clone the Repository

```bash
git clone https://github.com/FathimatusZN/medishop.git
cd medishop
```

2. Install Dependencies

```bash
npm install
```

3. Set Up Environment Variables

Create a `.env` file with the following (example):

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_db_password
DB_NAME=your_db_name
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
BASE_URL=http://localhost:3000
```

4. Run the Development Server

```bash
npm run dev
```

Access the app at `http://localhost:3000`

---

## Deployment ##

This app can be deployed on Vercel, Render, or any Node.js-compatible hosting. Make sure to also provision a PostgreSQL database and configure environment variables accordingly.

---

## License ##

This project is licensed for educational and development use.

---

## Acknowledgements ##

Thanks to all open-source libraries and frameworks used in this project.
