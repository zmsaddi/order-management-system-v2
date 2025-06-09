-- ===================================================================
-- نظام إدارة الطلبات المتطور v2.0
-- مخطط قاعدة البيانات الكامل مع الأمان المتقدم
-- ===================================================================

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- إنشاء الأنواع المخصصة
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

-- ===================================================================
-- الجداول الأساسية
-- ===================================================================

-- جدول المستخدمين (يمتد من auth.users)
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

-- جدول إعدادات الشركة
CREATE TABLE IF NOT EXISTS public.company_settings (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'Order Management System',
    company_name_ar TEXT DEFAULT 'نظام إدارة الطلبات',
    company_name_fr TEXT DEFAULT 'Système de Gestion des Commandes',
    company_name_nl TEXT DEFAULT 'Bestellingsbeheersysteem',
    logo_url TEXT,
    address TEXT DEFAULT 'Company Address',
    address_ar TEXT DEFAULT 'عنوان الشركة',
    address_fr TEXT DEFAULT 'Adresse de l''entreprise',
    address_nl TEXT DEFAULT 'Bedrijfsadres',
    phone TEXT DEFAULT '+1234567890',
    email TEXT DEFAULT 'info@company.com',
    website TEXT DEFAULT 'www.company.com',
    tax_number TEXT DEFAULT 'TAX123456',
    registration_number TEXT DEFAULT 'REG123456',
    currency_code TEXT NOT NULL DEFAULT 'EUR',
    currency_symbol TEXT NOT NULL DEFAULT '€',
    default_language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول فئات المنتجات
CREATE TABLE IF NOT EXISTS public.product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES public.product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المنتجات
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

-- جدول الطلبات
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

-- جدول منتجات الطلبات
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

-- جدول سجل التدقيق
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

-- جدول سجل الأمان
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

-- جدول إدارة الجلسات
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

-- ===================================================================
-- الفهارس لتحسين الأداء
-- ===================================================================

-- فهارس جدول المستخدمين
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);

-- فهارس جدول المنتجات
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

-- فهارس جدول الطلبات
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep ON public.orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);

-- فهارس جدول منتجات الطلبات
CREATE INDEX IF NOT EXISTS idx_order_products_order_id ON public.order_products(order_id);
CREATE INDEX IF NOT EXISTS idx_order_products_product_id ON public.order_products(product_id);

-- فهارس جدول سجل التدقيق
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- فهارس جدول سجل الأمان
CREATE INDEX IF NOT EXISTS idx_security_log_user_id ON public.security_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_log_action ON public.security_log(action);
CREATE INDEX IF NOT EXISTS idx_security_log_created_at ON public.security_log(created_at);

-- فهارس جدول الجلسات
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- فهارس مركبة للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_orders_rep_status_date ON public.orders(sales_rep_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products(category_id, is_active);

-- ===================================================================
-- الوظائف المخصصة لإدارة المستخدمين
-- ===================================================================

-- وظيفة الحذف الآمن للمستخدمين مع نقل البيانات
CREATE OR REPLACE FUNCTION safe_delete_user(
    user_id_to_delete UUID,
    transfer_orders_to UUID DEFAULT NULL,
    transfer_products_to UUID DEFAULT NULL,
    reason TEXT DEFAULT 'User deletion'
)
RETURNS JSONB AS $$
DECLARE
    user_record RECORD;
    orders_count INTEGER;
    products_count INTEGER;
    result JSONB;
BEGIN
    -- التحقق من وجود المستخدم
    SELECT * INTO user_record FROM public.users WHERE id = user_id_to_delete;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- منع حذف آخر مدير
    IF user_record.role = 'admin' THEN
        IF (SELECT COUNT(*) FROM public.users WHERE role = 'admin' AND status = 'active') <= 1 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Cannot delete the last admin user'
            );
        END IF;
    END IF;
    
    -- عد البيانات المرتبطة
    SELECT COUNT(*) INTO orders_count FROM public.orders WHERE sales_rep_id = user_id_to_delete;
    SELECT COUNT(*) INTO products_count FROM public.products WHERE created_by = user_id_to_delete;
    
    -- نقل الطلبات إذا تم تحديد مستخدم مستقبل
    IF transfer_orders_to IS NOT NULL AND orders_count > 0 THEN
        UPDATE public.orders 
        SET sales_rep_id = transfer_orders_to,
            updated_at = NOW()
        WHERE sales_rep_id = user_id_to_delete;
        
        -- تسجيل عملية النقل
        INSERT INTO public.audit_log (
            table_name, record_id, action, user_id, new_values
        ) VALUES (
            'orders', 'bulk_transfer', 'TRANSFER_ORDERS', auth.uid(),
            jsonb_build_object(
                'from_user', user_id_to_delete,
                'to_user', transfer_orders_to,
                'orders_count', orders_count,
                'reason', reason
            )
        );
    END IF;
    
    -- نقل المنتجات إذا تم تحديد مستخدم مستقبل
    IF transfer_products_to IS NOT NULL AND products_count > 0 THEN
        UPDATE public.products 
        SET created_by = transfer_products_to,
            updated_at = NOW()
        WHERE created_by = user_id_to_delete;
        
        -- تسجيل عملية النقل
        INSERT INTO public.audit_log (
            table_name, record_id, action, user_id, new_values
        ) VALUES (
            'products', 'bulk_transfer', 'TRANSFER_PRODUCTS', auth.uid(),
            jsonb_build_object(
                'from_user', user_id_to_delete,
                'to_user', transfer_products_to,
                'products_count', products_count,
                'reason', reason
            )
        );
    END IF;
    
    -- تسجيل محاولة الحذف
    INSERT INTO public.audit_log (
        table_name, record_id, action, user_id, old_values
    ) VALUES (
        'users', user_id_to_delete::TEXT, 'DELETE_ATTEMPT', auth.uid(),
        to_jsonb(user_record)
    );
    
    -- حذف المستخدم من الجدول العام
    DELETE FROM public.users WHERE id = user_id_to_delete;
    
    -- حذف المستخدم من جدول المصادقة
    DELETE FROM auth.users WHERE id = user_id_to_delete;
    
    -- تسجيل نجاح الحذف
    INSERT INTO public.audit_log (
        table_name, record_id, action, user_id, new_values
    ) VALUES (
        'users', user_id_to_delete::TEXT, 'DELETE_SUCCESS', auth.uid(),
        jsonb_build_object(
            'transferred_orders', COALESCE(orders_count, 0),
            'transferred_products', COALESCE(products_count, 0),
            'reason', reason
        )
    );
    
    -- إرجاع النتيجة
    result := jsonb_build_object(
        'success', true,
        'deleted_user', user_record.name,
        'transferred_orders', COALESCE(orders_count, 0),
        'transferred_products', COALESCE(products_count, 0)
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- تسجيل فشل الحذف
        INSERT INTO public.audit_log (
            table_name, record_id, action, user_id, new_values
        ) VALUES (
            'users', user_id_to_delete::TEXT, 'DELETE_FAILED', auth.uid(),
            jsonb_build_object('error', SQLERRM)
        );
        
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة تعطيل المستخدم
CREATE OR REPLACE FUNCTION disable_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    old_status user_status;
BEGIN
    SELECT status INTO old_status FROM public.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    UPDATE public.users 
    SET 
        status = 'inactive',
        updated_at = NOW()
    WHERE id = user_id;
    
    -- إلغاء جميع جلسات المستخدم
    UPDATE public.user_sessions 
    SET is_active = false 
    WHERE user_id = user_id;
    
    -- تسجيل العملية
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

-- وظيفة تفعيل المستخدم
CREATE OR REPLACE FUNCTION enable_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    old_status user_status;
BEGIN
    SELECT status INTO old_status FROM public.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    UPDATE public.users 
    SET 
        status = 'active',
        login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- تسجيل العملية
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

-- وظيفة معالجة محاولات تسجيل الدخول الفاشلة
CREATE OR REPLACE FUNCTION handle_failed_login(
    user_email TEXT, 
    ip_addr INET DEFAULT NULL, 
    user_agent_str TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '15 minutes';
BEGIN
    SELECT * INTO user_record FROM public.users WHERE email = user_email;
    
    IF FOUND THEN
        UPDATE public.users 
        SET 
            login_attempts = login_attempts + 1,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        -- قفل الحساب إذا تجاوز الحد الأقصى
        IF user_record.login_attempts + 1 >= max_attempts THEN
            UPDATE public.users 
            SET 
                locked_until = NOW() + lockout_duration,
                updated_at = NOW()
            WHERE id = user_record.id;
        END IF;
        
        -- تسجيل الحدث الأمني
        INSERT INTO public.security_log (
            user_id, action, ip_address, user_agent, success, details
        ) VALUES (
            user_record.id, 'FAILED_LOGIN', ip_addr, user_agent_str, false,
            jsonb_build_object('attempts', user_record.login_attempts + 1)
        );
    ELSE
        -- تسجيل محاولة تسجيل دخول لمستخدم غير موجود
        INSERT INTO public.security_log (
            action, ip_address, user_agent, success, details
        ) VALUES (
            'FAILED_LOGIN_INVALID_USER', ip_addr, user_agent_str, false,
            jsonb_build_object('email', user_email)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة معالجة تسجيل الدخول الناجح
CREATE OR REPLACE FUNCTION handle_successful_login(
    user_id UUID, 
    ip_addr INET DEFAULT NULL, 
    user_agent_str TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- إعادة تعيين محاولات تسجيل الدخول وتحديث آخر دخول
    UPDATE public.users 
    SET 
        login_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- تسجيل الحدث الأمني
    INSERT INTO public.security_log (
        user_id, action, ip_address, user_agent, success
    ) VALUES (
        user_id, 'SUCCESSFUL_LOGIN', ip_addr, user_agent_str, true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- وظيفة تنظيف الجلسات المنتهية الصلاحية
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

-- ===================================================================
-- المشغلات (Triggers)
-- ===================================================================

-- وظيفة تحديث الطابع الزمني
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق مشغلات التحديث
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

-- وظيفة تسجيل التغييرات
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSE -- UPDATE
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- العثور على الحقول المتغيرة
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
        
        -- تخطي إذا لم تكن هناك تغييرات فعلية
        IF array_length(changed_fields, 1) IS NULL THEN
            RETURN COALESCE(NEW, OLD);
        END IF;
    END IF;
    
    -- إدراج سجل التدقيق
    INSERT INTO public.audit_log (
        table_name, record_id, action, old_values, new_values, 
        changed_fields, user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)::TEXT,
        TG_OP,
        old_data,
        new_data,
        changed_fields,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق مشغلات التدقيق
DROP TRIGGER IF EXISTS audit_users_changes ON public.users;
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_orders_changes ON public.orders;
CREATE TRIGGER audit_orders_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_products_changes ON public.products;
CREATE TRIGGER audit_products_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION log_changes();

-- ===================================================================
-- سياسات الأمان (RLS)
-- ===================================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Sales managers can view their team" ON public.users;
CREATE POLICY "Sales managers can view their team" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

-- سياسات جدول إعدادات الشركة
DROP POLICY IF EXISTS "Everyone can view company settings" ON public.company_settings;
CREATE POLICY "Everyone can view company settings" ON public.company_settings
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only admins can modify company settings" ON public.company_settings;
CREATE POLICY "Only admins can modify company settings" ON public.company_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- سياسات جدول المنتجات
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
CREATE POLICY "Everyone can view active products" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and sales managers can manage products" ON public.products;
CREATE POLICY "Admins and sales managers can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

-- سياسات جدول الطلبات
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (
        sales_rep_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('admin', 'sales_manager')
        )
    );

-- سياسات جدول منتجات الطلبات
DROP POLICY IF EXISTS "Order products follow order policies" ON public.order_products;
CREATE POLICY "Order products follow order policies" ON public.order_products
    FOR ALL USING (
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

-- سياسات سجل التدقيق
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- سياسات سجل الأمان
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_log;
CREATE POLICY "Admins can view security logs" ON public.security_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- سياسات جلسات المستخدمين
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- ===================================================================
-- البيانات الأولية
-- ===================================================================

-- إدراج إعدادات الشركة الافتراضية
INSERT INTO public.company_settings (
    company_name, company_name_ar, company_name_fr, company_name_nl,
    address, address_ar, address_fr, address_nl,
    phone, email, website, tax_number, registration_number,
    currency_code, currency_symbol, default_language
) VALUES (
    'Order Management System',
    'نظام إدارة الطلبات',
    'Système de Gestion des Commandes',
    'Bestellingsbeheersysteem',
    'Company Address, City, Country',
    'عنوان الشركة، المدينة، البلد',
    'Adresse de l''entreprise, Ville, Pays',
    'Bedrijfsadres, Stad, Land',
    '+1234567890',
    'info@orderms.com',
    'www.orderms.com',
    'TAX123456789',
    'REG987654321',
    'EUR',
    '€',
    'en'
) ON CONFLICT DO NOTHING;

-- إدراج فئات المنتجات الافتراضية
INSERT INTO public.product_categories (name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Home & Garden', 'Home improvement and garden supplies'),
    ('Books', 'Books and educational materials'),
    ('Sports', 'Sports equipment and accessories')
ON CONFLICT DO NOTHING;

-- ===================================================================
-- وظائف مساعدة إضافية
-- ===================================================================

-- وظيفة حساب إجمالي الطلب
CREATE OR REPLACE FUNCTION calculate_order_total(order_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    subtotal NUMERIC := 0;
    tax_rate NUMERIC := 0;
    tax_amount NUMERIC := 0;
    total NUMERIC := 0;
BEGIN
    -- حساب المجموع الفرعي
    SELECT COALESCE(SUM(subtotal), 0) INTO subtotal
    FROM public.order_products 
    WHERE order_id = calculate_order_total.order_id;
    
    -- الحصول على معدل الضريبة
    SELECT COALESCE(orders.tax_rate, 0) INTO tax_rate
    FROM public.orders 
    WHERE id = calculate_order_total.order_id;
    
    -- حساب مبلغ الضريبة
    tax_amount := subtotal * (tax_rate / 100);
    
    -- حساب الإجمالي
    total := subtotal + tax_amount;
    
    -- تحديث الطلب
    UPDATE public.orders 
    SET 
        subtotal = calculate_order_total.subtotal,
        tax_amount = calculate_order_total.tax_amount,
        total = calculate_order_total.total,
        updated_at = NOW()
    WHERE id = calculate_order_total.order_id;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- مشغل لحساب إجمالي الطلب تلقائياً
CREATE OR REPLACE FUNCTION trigger_calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_order_total(COALESCE(NEW.order_id, OLD.order_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_calculate_order_total ON public.order_products;
CREATE TRIGGER auto_calculate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON public.order_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_order_total();

-- ===================================================================
-- إنشاء المستخدم الافتراضي (يتم تشغيله بعد إنشاء المستخدم في auth.users)
-- ===================================================================

-- وظيفة إنشاء المستخدم الافتراضي
CREATE OR REPLACE FUNCTION create_default_admin()
RETURNS VOID AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- البحث عن المستخدم الافتراضي في auth.users
    SELECT id INTO admin_id 
    FROM auth.users 
    WHERE email = 'zmsaddi@gmail.com';
    
    -- إذا وُجد المستخدم، أضفه إلى جدول المستخدمين العام
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.users (
            id, name, email, role, employee_id, status
        ) VALUES (
            admin_id,
            'System Administrator',
            'zmsaddi@gmail.com',
            'admin',
            'ADMIN001',
            'active'
        ) ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            status = 'active',
            updated_at = NOW();
            
        -- تسجيل إنشاء المستخدم الافتراضي
        INSERT INTO public.audit_log (
            table_name, record_id, action, new_values
        ) VALUES (
            'users', admin_id::TEXT, 'CREATE_DEFAULT_ADMIN',
            jsonb_build_object('email', 'zmsaddi@gmail.com', 'role', 'admin')
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تشغيل وظيفة إنشاء المستخدم الافتراضي
SELECT create_default_admin();

-- ===================================================================
-- تنظيف وتحسين نهائي
-- ===================================================================

-- تحديث إحصائيات الجداول
ANALYZE public.users;
ANALYZE public.company_settings;
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_products;
ANALYZE public.audit_log;
ANALYZE public.security_log;
ANALYZE public.user_sessions;

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE 'تم إنشاء قاعدة البيانات بنجاح! النظام جاهز للاستخدام.';
    RAISE NOTICE 'المستخدم الافتراضي: zmsaddi@gmail.com (مدير عام)';
    RAISE NOTICE 'كلمة المرور: Admin@spain2025';
END $$;

