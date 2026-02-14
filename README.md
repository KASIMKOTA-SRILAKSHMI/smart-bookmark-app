# 🚀 Smart Bookmark App

A simple real-time bookmark manager built using **Next.js (App Router)**, **Supabase**, and **Google OAuth**.

This application allows users to securely log in using Google and manage their own private bookmarks with real-time updates.

---

## 🔥 Live Demo

- 🌍 Live URL: https://smart-bookmark-app-ten-liard.vercel.app
- 📂 GitHub Repository: https://github.com/KASIMKOTA-SRILAKSHMI/smart-bookmark-app

---

## ✅ Features

- 🔐 Google OAuth Authentication (No email/password)
- ➕ Add bookmarks (Title + URL)
- 🗑 Delete your own bookmarks
- 🔒 Private bookmarks per user (Row Level Security enabled)
- ⚡ Real-time updates without page refresh
- 🌍 Deployed on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Authentication, Database, Realtime)
- Google OAuth 2.0
- Tailwind CSS
- Vercel (Deployment)

---

## 🧠 How It Works

### 1️⃣ Authentication

- Users log in using Google OAuth.
- Supabase handles authentication.
- No email/password authentication is implemented.
- Each user receives a unique `user.id`.

---

### 2️⃣ Database Structure

```sql
create table bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);
```

- Row Level Security (RLS) is enabled.
- Users can only access their own bookmarks.

---

### 3️⃣ Real-Time Updates

Supabase Realtime is used to listen for database changes:

```js
supabase
  .channel("bookmarks-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookmarks" },
    fetchBookmarks
  )
  .subscribe();
```

This ensures:
- If you open two tabs and add/delete a bookmark in one,
- It instantly appears in the other tab.

---

## ⚠️ Problems Faced & Solutions

### ❌ OAuth Redirect Error After Deployment
**Problem:** Google login failed after deploying to Vercel.  
**Solution:** Added production URL in:
- Supabase → Authentication → URL Configuration
- Google Cloud → Authorized Redirect URIs

---

### ❌ Delete Not Updating Instantly
**Problem:** Bookmarks required refresh after delete.  
**Solution:** Enabled Supabase Realtime and subscribed to `postgres_changes`.

---

### ❌ Vercel Build Failed
**Problem:** Deployment failed due to missing environment variables.  
**Solution:** Added environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## ⚙️ Local Setup

Clone the repository:

```bash
git clone https://github.com/KASIMKOTA-SRILAKSHMI/smart-bookmark-app.git
cd smart-bookmark-app
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📌 Assignment Requirements Covered

✔ Sign up and login using Google  
✔ Add bookmark (URL + Title)  
✔ Private bookmarks per user  
✔ Real-time updates  
✔ Delete own bookmarks  
✔ Deployed on Vercel  
✔ Public GitHub repository  
✔ README explaining implementation and issues faced  

---

## 👩‍💻 Author

**Kasimkota Srilakshmi**  
Fullstack Developer  

---

## 🎯 Final Note

This project demonstrates:

- Authentication flow understanding
- Secure database design with Row Level Security
- Real-time data synchronization
- Production deployment configuration
- OAuth setup and troubleshooting
