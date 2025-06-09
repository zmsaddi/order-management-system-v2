# نشر نظام إدارة الطلبات على Vercel

## 🚀 دليل النشر خطوة بخطوة

### 1. إعداد المستودع على GitHub

#### رفع الملفات:
```bash
git add .
git commit -m "Initial commit: Order Management System v2.0"
git branch -M main
git remote add origin https://github.com/your-username/order-management-system-v2.git
git push -u origin main
```

### 2. إعداد Vercel

#### الخطوات:
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخولك باستخدام GitHub
3. اضغط "New Project"
4. اختر مستودع `order-management-system-v2`
5. اضغط "Import"

#### إعدادات البناء:
- **Framework Preset**: Vue.js
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. متغيرات البيئة في Vercel

#### في لوحة تحكم Vercel، أضف:
```env
VITE_SUPABASE_URL=https://hifordsrgtmuhlhwsfar.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZm9yZHNyZ3RtdWhsaHdzZmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODE1MDgsImV4cCI6MjA2NTA1NzUwOH0.eGeNXKjiXjv_1MnM5R-0hs1FDKG54EoKASZLd9z4OhA
VITE_APP_NAME=Order Management System
VITE_APP_VERSION=2.0.0
```

### 4. إعدادات Supabase للإنتاج

#### في لوحة تحكم Supabase:
1. اذهب إلى **Authentication** > **URL Configuration**
2. أضف رابط Vercel إلى **Site URL**:
   ```
   https://your-project-name.vercel.app
   ```
3. أضف الرابط إلى **Redirect URLs**:
   ```
   https://your-project-name.vercel.app/auth/callback
   ```

### 5. النشر والاختبار

#### بعد النشر:
1. ستحصل على رابط مثل: `https://order-management-system-v2.vercel.app`
2. اختبر تسجيل الدخول بالحساب الافتراضي:
   - **البريد**: zmsaddi@gmail.com
   - **كلمة المرور**: Admin@spain2025

### 6. إعدادات إضافية

#### Custom Domain (اختياري):
1. في Vercel، اذهب إلى **Settings** > **Domains**
2. أضف النطاق المخصص
3. اتبع تعليمات DNS

#### Performance Optimization:
- تفعيل **Edge Functions** للسرعة
- ضبط **Caching Headers**
- تحسين **Image Optimization**

### 7. مراقبة ومتابعة

#### Analytics:
- تفعيل Vercel Analytics
- مراقبة الأداء والأخطاء
- تتبع استخدام المستخدمين

#### Monitoring:
- إعداد تنبيهات للأخطاء
- مراقبة قاعدة البيانات في Supabase
- متابعة سجلات الأمان

## 🔧 استكشاف الأخطاء

### مشاكل شائعة:

#### خطأ في البناء:
```bash
# تأكد من تثبيت جميع التبعيات
npm install
npm run build
```

#### مشاكل المصادقة:
- تحقق من URLs في Supabase
- تأكد من صحة متغيرات البيئة
- راجع إعدادات CORS

#### مشاكل الأداء:
- تحقق من حجم الحزمة
- راجع إعدادات التخزين المؤقت
- تحسين الصور والخطوط

## 📱 اختبار الإنتاج

### قائمة الاختبار:
- [ ] تسجيل الدخول والخروج
- [ ] تبديل اللغات
- [ ] إنشاء وتعديل الطلبات
- [ ] طباعة الفواتير
- [ ] الاستجابة على الأجهزة المختلفة
- [ ] اختبار الأدوار المختلفة

### اختبار الأمان:
- [ ] محاولات تسجيل دخول خاطئة
- [ ] الوصول غير المصرح به
- [ ] حماية البيانات الحساسة
- [ ] تسجيل الأنشطة

## 🎉 النشر مكتمل!

بعد اتباع هذه الخطوات، سيكون نظام إدارة الطلبات متاحاً على الإنترنت ومتاحاً للاستخدام الفوري!

