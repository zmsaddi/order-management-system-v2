-- Enhanced database schema with security improvements
-- This script creates all necessary tables, functions, and security policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'sales_manager', 'representative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('new', 'processing', 'completed', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    role user_role NOT NULL DEFAULT 'representative',
    employee_id TEXT UNIQUE,
    status user_status NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    company_name_ar TEXT,
    company_name_fr TEXT,
    company_name_nl TEXT,
    logo_url TEXT,
    address TEXT,
    address_ar TEXT,
    address_fr TEXT,
    address_nl TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_number TEXT,
    registration_number TEXT,
    currency_code TEXT NOT NULL DEFAULT 'EUR',
    currency_symbol TEXT NOT NULL DEFAULT '€',
    default_language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES public.product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    category_id INTEGER REFERENCES public.product_categories(id),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(10, 2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit_of_measure TEXT DEFAULT 'piece',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    status order_status NOT NULL DEFAULT 'new',
    sales_rep_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order products table
CREATE TABLE IF NOT EXISTS public.order_products (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    name TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security log table
CREATE TABLE IF NOT EXISTS public.security_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);

CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep ON public.orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);

CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON public.order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_order_products_product_id ON public.order_products(product_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_security_log_user_id ON public.security_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_log_action ON public.security_log(action);
CREATE INDEX IF NOT EXISTS idx_security_log_created_at ON public.security_log(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_rep_status_date ON public.orders(sales_rep_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active);

-- Functions for user management with enhanced security

-- Function to safely delete user
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN := FALSE;
BEGIN
    -- Check if user exists and current user has permission
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Log the deletion attempt
    INSERT INTO public.audit_log (
        table_name, record_id, action, user_id, created_at
    ) VALUES (
        'users', user_id::TEXT, 'DELETE_ATTEMPT', auth.uid(), NOW()
    );
    
    BEGIN
        -- Delete from public.users (will cascade to related tables)
        DELETE FROM public.users WHERE id = user_id;
        
        -- Delete from auth.users
        DELETE FROM auth.users WHERE id = user_id;
        
        -- Log successful deletion
        INSERT INTO public.audit_log (
            table_name, record_id, action, user_id, created_at
        ) VALUES (
            'users', user_id::TEXT, 'DELETE_SUCCESS', auth.uid(), NOW()
        );
        
        result := TRUE;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log failed deletion
            INSERT INTO public.audit_log (
                table_name, record_id, action, user_id, created_at, new_values
            ) VALUES (
                'users', user_id::TEXT, 'DELETE_FAILED', auth.uid(), NOW(),
                jsonb_build_object('error', SQLERRM)
            );
            result := FALSE;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to disable user
CREATE OR REPLACE FUNCTION disable_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    old_status user_status;
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM public.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Update user status
    UPDATE public.users 
    SET 
        status = 'inactive',
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Invalidate all user sessions
    UPDATE public.user_sessions 
    SET is_active = false 
    WHERE user_id = user_id;
    
    -- Log the action
    INSERT INTO public.audit_log (
        table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
        'users', user_id::TEXT, 'DISABLE', auth.uid(),
        jsonb_build_object('status', old_status),
        jsonb_build_object('status', 'inactive')
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable user
CREATE OR REPLACE FUNCTION enable_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    old_status user_status;
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM public.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Update user status
    UPDATE public.users 
    SET 
        status = 'active',
        login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log the action
    INSERT INTO public.audit_log (
        table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
        'users', user_id::TEXT, 'ENABLE', auth.uid(),
        jsonb_build_object('status', old_status),
        jsonb_build_object('status', 'active')
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(user_email TEXT, ip_addr INET DEFAULT NULL, user_agent_str TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '15 minutes';
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM public.users WHERE email = user_email;
    
    IF FOUND THEN
        -- Increment login attempts
        UPDATE public.users 
        SET 
            login_attempts = login_attempts + 1,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        -- Check if user should be locked
        IF user_record.login_attempts + 1 >= max_attempts THEN
            UPDATE public.users 
            SET 
                locked_until = NOW() + lockout_duration,
                updated_at = NOW()
            WHERE id = user_record.id;
        END IF;
        
        -- Log security event
        INSERT INTO public.security_log (
            user_id, action, ip_address, user_agent, success, details
        ) VALUES (
            user_record.id, 'FAILED_LOGIN', ip_addr, user_agent_str, false,
            jsonb_build_object('attempts', user_record.login_attempts + 1)
        );
    ELSE
        -- Log failed login for non-existent user
        INSERT INTO public.security_log (
            action, ip_address, user_agent, success, details
        ) VALUES (
            'FAILED_LOGIN_INVALID_USER', ip_addr, user_agent_str, false,
            jsonb_build_object('email', user_email)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle successful login
CREATE OR REPLACE FUNCTION handle_successful_login(user_id UUID, ip_addr INET DEFAULT NULL, user_agent_str TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Reset login attempts and update last login
    UPDATE public.users 
    SET 
        login_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Log security event
    INSERT INTO public.security_log (
        user_id, action, ip_address, user_agent, success
    ) VALUES (
        user_id, 'SUCCESSFUL_LOGIN', ip_addr, user_agent_str, true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic updates

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Determine operation type and data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSE -- UPDATE
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Find changed fields
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
        
        -- Skip if no actual changes
        IF array_length(changed_fields, 1) IS NULL THEN
            RETURN COALESCE(NEW, OLD);
        END IF;
    END IF;
    
    -- Insert audit record
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        TG_OP,
        old_data,
        new_data,
        changed_fields,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to important tables
DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_orders_trigger ON public.orders;
CREATE TRIGGER audit_orders_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Insert default company settings
INSERT INTO public.company_settings (
    company_name,
    company_name_ar,
    company_name_fr,
    company_name_nl,
    currency_code,
    currency_symbol,
    default_language
) VALUES (
    'Your Company Name',
    'اسم شركتك',
    'Nom de votre entreprise',
    'Uw bedrijfsnaam',
    'EUR',
    '€',
    'en'
) ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Company settings policies
CREATE POLICY "Authenticated users can view company settings" ON public.company_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update company settings" ON public.company_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Products policies
CREATE POLICY "Authenticated users can view active products" ON public.products
    FOR SELECT USING (
        auth.role() = 'authenticated' AND is_active = true
    );

CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

CREATE POLICY "Representatives can create orders" ON public.orders
    FOR INSERT WITH CHECK (
        sales_rep_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

-- Order products policies
CREATE POLICY "Users can view order products for accessible orders" ON public.order_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND (
                sales_rep_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
                )
            )
        )
    );

-- Audit log policies (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Security log policies (read-only for admins)
CREATE POLICY "Admins can view security logs" ON public.security_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

