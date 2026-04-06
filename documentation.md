# 🏨 Hotel Food Ordering System: Application Documentation

This document provides a detailed overview of the application's architecture, user workflows, and the locations of key features in the codebase.

---

## 🏗️ Architecture Overview

The application is built using the **Next.js App Router** framework, utilizing **MongoDB** for data persistence and **JWT (Jose)** for secure authentication.

- **Frontend**: Next.js (React), Tailwind CSS (Aesthetics), Lucide Icons.
- **Backend**: Next.js API Routes (Serverless), Mongoose (ODM).
- **Security**: Next.js Middleware for Route Protection (RBAC).

---

## 🔑 Key Features & Code Locations

### 1. Customer Menu & Ordering
The primary customer-facing interface allows browsing the menu, adding items to a cart, and placing orders.

- **Main Menu**: [src/app/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/page.tsx)
- **Menu Card Component**: [src/components/MenuCard.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/components/MenuCard.tsx)
- **Cart Logic**: [src/components/CartSidebar.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/components/CartSidebar.tsx)
- **Order Placement API**: [src/app/api/orders/route.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/api/orders/route.ts)
- **Order Status Tracker**: [src/app/order-status/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/order-status/page.tsx)

### 2. Role-Based Access Control (RBAC)
Ensures that only authorized personnel can access management modules.

- **Authentication Logic**: [src/app/api/auth/login/route.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/api/auth/login/route.ts)
- **Security Middleware**: [src/middleware.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/middleware.ts)
- **Unified Login Portal**: [src/app/login/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/login/page.tsx)

### 3. Management Modules
The system is divided into three primary management sectors.

#### 👨‍🍳 Kitchen Module
Responsible for viewing incoming orders and updating their preparation status.
- **Kitchen Dashboard**: [src/app/kitchen/dashboard/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/kitchen/dashboard/page.tsx)
- **Dedicated Login**: [src/app/kitchen/login/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/kitchen/login/page.tsx)

#### 💳 Billing Module
Handles bill generation, discount application, and final payment settlement.
- **Billing Dashboard**: [src/app/billing/dashboard/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/billing/dashboard/page.tsx)
- **Dedicated Login**: [src/app/billing/login/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/billing/login/page.tsx)

#### 📊 Admin Dashboard
The "Mega-Dashboard" with full control over all modules, menu management, and reports.
- **Admin Dashboard**: [src/app/admin/dashboard/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/admin/dashboard/page.tsx)
- **Admin Login**: [src/app/admin/login/page.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/admin/login/page.tsx)

### 4. Real-Time Features & Resilience
- **Network Guard (Internet Speed)**: Detects slow/no internet and shows a "No Connection" page.
  - **Hook**: [src/hooks/useNetworkStatus.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/hooks/useNetworkStatus.ts)
  - **Component**: [src/components/NetworkGuard.tsx](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/components/NetworkGuard.tsx)
- **Live Stock Tracking**: Allows Admin/Kitchen to toggle item availability instantly.
  - **API**: [src/app/api/menu/route.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/app/api/menu/route.ts)

---

## 🔄 Application Workflow

### Customer Journey
1. **Browse**: Customer enters through a table QR (e.g., `/?table=5`) and sees the menu.
2. **Order**: Adds items to the cart. If an item becomes "Sold Out" via Admin, they see a notification.
3. **Pay**: Proceeds to payment (Razorpay or Counter).
4. **Track**: Upon success, they are redirected to `/order-status` where a real-time timer tracks their food preparation.

### Kitchen Workflow
1. **Receive**: Kitchen staff log in to `/kitchen/dashboard`.
2. **Accept**: New orders appear automatically with sound/toast alerts.
3. **Prepare**: Staff clicks "Start Cooking" (Status changed to `Preparing`).
4. **Complete**: Staff clicks "Ready" (Status changed to `Ready`, notifying the customer).

### Billing Workflow
1. **Identify**: Billing staff log in to `/billing/dashboard`.
2. **Finalize**: As orders reach `Delivered`, they appear in the billing list.
3. **Settle**: Staff applies any discounts, prints the physical bill, and marks the order as `Paid`.

### Admin Workflow
1. **Access**: Admin logs into `/admin/dashboard`.
2. **Control**: Can modify the entire menu, manage stock in real-time, view detailed sales reports, and jump into any kitchen or billing task as needed.

---

## 📁 Database Models
All data structures are defined in `src/models/`:
- **Menu**: [Menu.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/models/Menu.ts) (Name, price, category, availability, prepTime)
- **Order**: [Order.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/models/Order.ts) (Table, items, status, paymentStatus, totalAmount)
- **Rating**: [Rating.ts](file:///c:/Users/Kripa%20Hanna%20Shiju/OneDrive/Documents/Min%20Project/hotel_food_ordering_system/src/models/Rating.ts) (Comments, score, tableNumber, sessionId)
