# Luxe Booking – Opulent Odyssey

## Project Overview
Luxe Booking – Opulent Odyssey is a luxury hotel booking platform built as a capstone project. The application supports role-based user flows, booking management, optional file attachments, and admin moderation workflows.

The project uses a **multi-page Vite architecture** with modular Vanilla JavaScript for maintainable front-end logic across distinct page entries.

The backend is powered by **Supabase**, including:
- **Postgres Database** for core application data
- **Supabase Auth** for authentication and session handling
- **Supabase Storage** for booking file upload/download

## Features
- **Public pages:** Home, Hotels, Destinations, Adventures
- **Authentication:** Register, Login, Logout
- **Booking flow:** Create bookings with optional file attachment
- **My Account:** User-specific booking history and management
- **Admin panel:** Approve/reject bookings with role-based access control
- **File handling:** Upload and download booking attachments via Supabase Storage
- **Security:** Row Level Security (RLS) policies enforced at database level

## Architecture
### Frontend
- **Vite** (multi-page setup)
- **Vanilla JavaScript** (modular structure with page-specific scripts)
- **Bootstrap 5**

### Backend
- **Supabase Postgres**
- **Supabase Auth (JWT)**
- **Supabase Storage**
- **RLS policies** for secure, role-aware data access

## Database Schema
Main tables used in the project:

- **profiles**: Stores user profile details mapped to authenticated users.
- **user_roles**: Defines application roles (e.g., user/admin) for access control.
- **hotels**: Stores hotel listings and related metadata.
- **destinations**: Stores destination/location records displayed to users.
- **adventures**: Stores adventure experiences associated with travel offerings.
- **bookings**: Stores booking transactions, status, user ownership, and attachment references.

## Pages Implemented
- Home (`index.html`)
- Hotels
- Destinations
- Adventures
- Bookings
- Login
- Register
- User Page
- Admin

## Local Development Setup
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd "LuxeBooking Opulent Odysee"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
- Built with **Vite**
- Deployed on: **[Netlify/Vercel - add deployment URL here]**
- Required environment variables must be configured in the hosting dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Sample Credentials
Use placeholder values below and replace before final submission/demo:

### User
- **email:**
- **password:**

### Admin
- **email:**
- **password:**

## Supabase Storage
- Create a Storage bucket named `uploads` in Supabase.
- For MVP, set the bucket to **public** so uploaded booking attachments can be downloaded directly.
- Optional: for stronger security, use signed URLs instead of public access.
- This project uses the bucket for booking attachment upload/download.

## Migrations
Database schema and policy changes are tracked in:

- `supabase/migrations`
