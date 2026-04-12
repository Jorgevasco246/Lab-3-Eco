# Database Schema

## Setup

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;
```

## Tables

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'store', 'delivery'))
);

CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "userId" UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  "storeId" UUID NOT NULL REFERENCES stores(id)
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "consumerId" UUID NOT NULL REFERENCES users(id),
  "storeId" UUID NOT NULL REFERENCES stores(id),
  "deliveryId" UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'Creado',
  delivery_position GEOGRAPHY(POINT, 4326),
  destination GEOGRAPHY(POINT, 4326),
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "orderId" UUID NOT NULL REFERENCES orders(id),
  "productId" UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL
);
```

## Lab 4 - Alteraciones

```sql
-- Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Agregar columnas a orders
ALTER TABLE orders ADD COLUMN delivery_position GEOGRAPHY(POINT, 4326);
ALTER TABLE orders ADD COLUMN destination GEOGRAPHY(POINT, 4326);
```