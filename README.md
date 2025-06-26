# Merch Store - KHEA TRAPICHEO

A Next.js e-commerce application for event merchandise with real-time inventory management using Supabase.

## Features

- 🔐 **Authentication**: Supabase Auth with Google OAuth and email/password
- 🛍️ **Real-time Catalog**: Live product updates with stock management
- 🛒 **Shopping Cart**: Persistent cart with localStorage
- 📱 **Mobile-first Design**: Responsive UI optimized for mobile devices
- 🔄 **Real-time Updates**: Live inventory and order status updates
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 📧 **QR Code Email**: Automatic QR code generation and email sending for orders

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **Authentication**: Supabase Auth UI

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd merch-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema script from `scripts/01_supabase_schema.sql` in your Supabase SQL editor
3. Get your project URL and anon key from the Supabase dashboard

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Configure Supabase Auth

1. Go to your Supabase dashboard → Authentication → Settings
2. Add your domain to the Site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/catalog`

### 6. Enable Google OAuth (Optional)

1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth credentials

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- **users**: User profiles and authentication data
- **categories**: Product categories
- **products**: Product information
- **product_variants**: Product sizes and prices
- **product_images**: Product images
- **stands**: Physical store locations
- **stand_stock**: Inventory at each stand
- **orders**: Customer orders
- **order_items**: Order line items
- **stock_movements**: Inventory movement logs

## Project Structure

```
merch-client/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── catalog/           # Product catalog
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── contexts/             # React context providers
│   ├── auth-context.tsx  # Authentication state
│   ├── app-context.tsx   # App data and real-time updates
│   └── cart-context.tsx  # Shopping cart state
├── lib/                  # Utility functions
│   └── supabase.ts       # Supabase client configuration
└── scripts/              # Database migration scripts
```

## Real-time Features

The application uses Supabase's real-time subscriptions to provide live updates for:

- Product inventory changes
- Order status updates
- Stock movements
- New product additions

## Authentication Flow

1. Users can sign up/sign in with email/password or Google OAuth
2. User profiles are automatically created in the `users` table
3. Protected routes redirect unauthenticated users to `/auth`
4. Session persistence across browser sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## QR Code Email Feature

The application now includes automatic QR code generation and email sending for orders. When a customer completes a purchase, they receive an email containing:

- Order details and summary
- QR code for pickup
- Pickup location information
- Important instructions

### Setup

1. **Resend Configuration**: Set up your Resend API key in your environment variables:
   ```bash
   RESEND_API_KEY=your_resend_api_key_here
   ```

2. **Email Templates**: The email templates are located in `components/EmailTemplate.tsx` and include:
   - `NewOrderEmailTemplate`: Main template for order confirmations with QR codes
   - Other templates for different email types

3. **QR Code Generation**: QR codes are automatically generated using the `generateQRCode` utility function in `lib/utils.ts`

### Email Features

- **QR Code Display**: Embedded QR codes using `qrcode.react`
- **Responsive Design**: Mobile-friendly email layout
- **Order Details**: Complete order summary with items and prices
- **Pickup Instructions**: Clear instructions for order pickup
- **Error Handling**: Non-blocking email sending (order process continues even if email fails)

### Customization

You can customize the email templates by modifying the `NewOrderEmailTemplate` component. The template supports:

- Custom styling and branding
- Dynamic content (order details, QR codes, pickup locations)
- Multiple languages (currently Spanish)
- Responsive design for mobile devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `RESEND_API_KEY`: Your Resend API key for email sending
- `NEXT_PUBLIC_WEB_URL`: Your application URL

## Database Setup

Run the SQL scripts in the `scripts/` directory to set up your database schema. 