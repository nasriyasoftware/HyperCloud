import { Page } from '../../../hypercloud';
import path from 'path';

const page = new Page('hypercloud_403');

page.template.path.set(path.resolve(__dirname, 'hypercloud_401_403.ejs'));
page.scripts.link.internal({ filePath: path.resolve(__dirname, 'script.js'), defer: true });
page.stylesheets.link.internal(path.resolve(__dirname, 'style.css'));

page.title.multilingual.set({
    default: 'Forbidden',
    en: 'Forbidden',
    ar: 'غير مسموح'
})

page.description.multilingual.set({
    default: "You're not allowed to access this page or resource",
    en: "You're not allowed to access this page or resource",
    ar: "غير مسموح لك بالوصول لهذا الصفحة"
})

const defaultLocals = {
    title: "Forbidden",
    code: 403,
    description: "You're not allowed to access this page or resource",
    commands: {
        "code": "ERROR CODE",
        "description": "ERROR DESCRIPTION",
        "cause": "ERROR DESCRIPTION",
        "allowed": "SOME PAGES ON THIS SERVER THAT YOU DO HAVE PERMISSION TO ACCESS",
        "regards": "HAVE A NICE DAY :-)"
    },
    content: {
        "code": "HTTP 403 Forbidden",
        "description": "Access Denied. You Do Not Have The Permission To Access This Page On This Server",
        "cause": "execute access unauthorized, read access unauthorized, write access unauthorized, ssl required, ssl 128 required, ip address rejected, client certificate required, site access denied, too many users, invalid configuration, password change, mapper denied access, client certificate revoked, directory listing denied, client access licenses exceeded, client certificate is untrusted or invalid, client certificate has expired or is not yet valid, passport logon failed, source access denied, infinite depth is denied, too many requests from the same client ip",
        "allowed": [{ label: 'Home', link: '/' }, { label: 'About Us', link: '/about' }, { label: 'Contact Us', link: '/support/contact' }],
    }
}

page.locals.multilingual.set({
    default: defaultLocals,
    en: defaultLocals,
    ar: {
        title: 'غير مسموح',
        code: 403,
        description: "غير مسموح لك بالوصول لهذا الصفحة",
        commands: {
            code: 'رمز الخطاً',
            description: 'وصف الخطً',
            cause: 'الخطأ من المحتمل أن يكون سببه',
            allowed: 'بعض الصفحات على الخادم التي لديك تصريح بزيارتها',
            regards: 'إستمتع بيومك :-)'
        },
        content: {
            code: '403 غير مسموح',
            description: 'الوصول مرفوض. ليس لديك إذن للوصول الى هذه الصفحة على هذا الخادم',
            cause: 'تنفيذ الوصول ممنوع، الوصول للقراءة، الوصول ممنوع، SSL مطلوب، SSL 128 مطلوب، عنوان IP مرفوض، شهادة العميل مطلوبة، تم رفض الوصول إلى الموقع،  عدد كبير جدًا من المستخدمين، تكوين غير صالح، تغيير كلمة المرور، تم رفض الوصول إلى مصمم الخرائط، تم إبطال شهادة العميل، الدليل تم رفض القائمة، تجاوز تراخيص وصول العميل، شهادة العميل غير موثوقة أو غير صالحة، انتهت صلاحية شهادة العميل أو ليست صالحة بعد، فشل تسجيل الدخول بجواز السفر، تم رفض الوصول إلى المصدر، تم رفض العمق اللانهائي، طلبات كثيرة جدًا من نفس عنوان IP للعميل',
            allowed: [{ label: 'الرئيسية', link: '/' }, { label: 'عنا', link: '/about' }, { label: 'إتصل بنا', link: '/support/contact' }],
        }
    }
})

export default page;