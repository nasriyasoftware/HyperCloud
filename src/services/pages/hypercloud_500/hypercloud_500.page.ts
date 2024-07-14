import { Page } from "../../../hypercloud";
import path from 'path';

const page = new Page('hypercloud_500');

page.template.path.set(path.resolve(__dirname, 'hypercloud_500.ejs'));
page.stylesheets.link.internal(path.resolve(__dirname, 'style.css'));

page.title.multilingual.set({
    default: 'Server Error',
    en: 'Server Error',
    ar: 'خطأ في الخادم'
})

page.description.multilingual.set({
    default: 'An unexpected server error has occurred',
    en: 'An unexpected server error has occurred',
    ar: 'حدث غير متوقع في الخادم'
})

const defaultLocals = {
    title: 'Server Error',
    subtitle: 'Internal <code>Server&nbsp;Error<span>!</span></code>',
    message: `<p> We're sorry, but something went wrong on our end. Our team has been notified, and we're working to fix the issue as soon as possible. </p>\n<p>In the meantime, you can try refreshing the page or coming back later. If the problem persists, feel free to <a href="/contact-us">contact us</a> for further assistance.</p>\n<p>Thank you for your understanding.</p>`,
}

page.locals.multilingual.set({
    default: defaultLocals,
    en: defaultLocals,
    ar: {
        title: 'خطاً في الخادم',
        subtitle: 'عذراً! حدث خطأ في الخادم',
        message: 'نحن آسفون، ولكن حدث خطأ ما من جانبنا. لقد تم إخطار فريقنا، ونحن نعمل على حل المشكلة في أقرب وقت ممكن.'
    }
})

export default page;