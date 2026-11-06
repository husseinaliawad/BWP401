# لمّة — BWP401

موقع تعليمي لدليل فعاليات الجامعة، مبني باستخدام HTML وCSS وJavaScript.
ملفات Bootstrap والخطوط الاحتياطية موجودة ضمن `assets/vendor` ويجب رفع مجلد `assets` كاملاً.

## التشغيل محلياً

من مجلد المشروع:

```sh
python -m http.server 8000
```

افتح <http://localhost:8000>.

## الرفع إلى GitHub

أنشئ مستودعاً فارغاً على حساب `husseinaliawad`، ثم نفّذ الأوامر التالية من مجلد المشروع.
استبدل `REPOSITORY_NAME` باسم المستودع الذي أنشأته:

```sh
git init -b main
git add .
git commit -m "Prepare website for Render"
git remote add origin https://github.com/husseinaliawad/REPOSITORY_NAME.git
git push -u origin main
```

## النشر على Render

### باستخدام ملف الإعداد الجاهز

1. افتح [لوحة Render](https://dashboard.render.com/) واربط حساب GitHub الذي يملك المستودع.
2. اختر **New → Blueprint** وحدد مستودع المشروع والفرع الذي رفعت عليه الملفات.
3. سيقرأ Render ملف `render.yaml` وينشئ Static Site باسم `bwp401`؛ راجع الإعدادات ثم ابدأ النشر.
4. افتح رابط الموقع الذي يظهر بعد اكتمال النشر.

### الإعداد اليدوي

اختر **New → Static Site** وحدد المستودع، ثم استخدم:

| الإعداد | القيمة |
| --- | --- |
| Branch | الفرع الذي رفعت عليه المشروع، عادةً `main` |
| Root Directory | اتركه فارغاً إذا كان المشروع في جذر المستودع |
| Build Command | `bash build.sh` |
| Publish Directory | `dist` |

المشروع جاهز كملفات ثابتة ولا يحتاج أمر تشغيل أو متغيرات بيئة.
ملف `build.sh` يعمل داخل بيئة Render ويجمع صفحات HTML ومجلد `assets` داخل `dist`.
ارفع هذا الملف مع بقية التعديلات إلى GitHub قبل بدء النشر. خانة Build Command تحتوي `bash build.sh` فقط.
مجلدا `dist` و`output` مستثنيان من Git؛ Render ينشئ `dist` أثناء النشر.

نموذج التواصل الحالي تعليمي ويتحقق من المدخلات داخل المتصفح فقط؛ الاستضافة وحدها لا تضيف إرسال بريد.

المراجع: [Static Sites](https://render.com/docs/static-sites)، [Blueprint YAML](https://render.com/docs/blueprint-spec).
