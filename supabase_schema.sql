-- ============================================
-- VINTERA — Pełny schemat bazy danych
-- Wklej do SQL Editor w Supabase i kliknij Run
-- ============================================

-- Rozszerzenia
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT DEFAULT 'Katowice, Śląsk',
  lat NUMERIC,
  lng NUMERIC,
  is_boutique BOOLEAN DEFAULT FALSE,
  boutique_verified BOOLEAN DEFAULT FALSE,
  boutique_name TEXT,
  boutique_description TEXT,
  rating NUMERIC DEFAULT 5.0,
  transactions_count INTEGER DEFAULT 0,
  ai_embedding VECTOR(1536),
  ai_preferences JSONB DEFAULT '{}',
  ai_activity_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Listings
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  size TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  condition TEXT NOT NULL DEFAULT 'dobry',
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PLN',
  status TEXT DEFAULT 'active',
  location TEXT DEFAULT 'Katowice',
  lat NUMERIC,
  lng NUMERIC,
  ai_embedding VECTOR(1536),
  ai_tags TEXT[] DEFAULT '{}',
  ai_price_suggestion NUMERIC,
  ai_moderation_status TEXT DEFAULT 'approved',
  ai_moderation_reason TEXT,
  ai_quality_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Listing Images
CREATE TABLE public.listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  ai_description TEXT,
  ai_objects TEXT[] DEFAULT '{}',
  ai_colors TEXT[] DEFAULT '{}',
  perceptual_hash TEXT,
  exif_data JSONB DEFAULT '{}',
  ai_nsfw_score NUMERIC DEFAULT 0,
  ai_fake_probability NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  ai_embedding VECTOR(1536),
  ai_sentiment TEXT DEFAULT 'neutral',
  ai_flagged BOOLEAN DEFAULT FALSE,
  ai_flag_reason TEXT,
  ai_category TEXT DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Behaviors
CREATE TABLE public.user_behaviors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  session_id TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Listings viewable by all" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Images viewable by all" ON public.listing_images FOR SELECT USING (TRUE);
CREATE POLICY "Users insert own images" ON public.listing_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.listings WHERE listings.id = listing_images.listing_id AND listings.user_id = auth.uid())
);

CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users own behaviors" ON public.user_behaviors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert behaviors" ON public.user_behaviors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Automatyzacja
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 5)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indeksy
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_user ON public.listings(user_id);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_behaviors_user ON public.user_behaviors(user_id);


-- ============================================
-- INVITE CODES (system kodów zaproszeń)
-- Usuń tę tabelę lub ustaw is_active = false
-- gdy platforma będzie publiczna
-- ============================================

CREATE TABLE public.invite_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Przykładowe kody (zmień na własne!)
INSERT INTO public.invite_codes (code, description, max_uses) VALUES
  ('VINTERA2026', 'Kod główny - 100 użyć', 100),
  ('SLASK', 'Kod regionalny - Śląsk', 50),
  ('KATO', 'Kod dla Katowic', 50)
  ON CONFLICT (code) DO NOTHING;


-- ============================================
-- WISHLIST (zapisane produkty)
-- ============================================
CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================
CREATE TABLE public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- NOTIFICATIONS (system powiadomień)
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- message, sale, review, system
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- listing, user, review
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin view logs" ON public.admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.username = 'admin')
);


-- ============================================
-- ORDERS (zamówienia / transakcje)
-- ============================================
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Dane produktu (snapshot w momencie zakupu)
  listing_title TEXT NOT NULL,
  listing_price NUMERIC NOT NULL,
  listing_image TEXT,

  -- Dane dostawy
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, shipped, delivered, cancelled, refunded
  payment_method TEXT DEFAULT 'manual', -- manual, stripe, blik
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed
  tracking_number TEXT,

  -- AI fields
  ai_fraud_score NUMERIC DEFAULT 0,
  ai_risk_level TEXT DEFAULT 'low', -- low, medium, high

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers view own sales" ON public.orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Buyers insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers update own sales" ON public.orders FOR UPDATE USING (auth.uid() = seller_id);

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Trigger: po dostarczeniu zamówienia, zwiększ licznik transakcji sprzedającego
CREATE OR REPLACE FUNCTION public.handle_order_delivered()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.profiles 
    SET transactions_count = transactions_count + 1 
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_delivered_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_order_delivered();


-- ============================================
-- SAVED ADDRESSES (zapisane adresy dostawy)
-- ============================================
CREATE TABLE public.saved_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own addresses" ON public.saved_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own addresses" ON public.saved_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own addresses" ON public.saved_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own addresses" ON public.saved_addresses FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_addresses_user ON public.saved_addresses(user_id);

-- ============================================
-- POPRAWKA: orders - dodaj email do buyer
-- ============================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email_snapshot TEXT;

-- ============================================
-- POPRAWKA: profiles - dodaj email
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
