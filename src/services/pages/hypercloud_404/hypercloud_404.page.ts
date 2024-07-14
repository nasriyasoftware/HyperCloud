import { Page } from '../../../hypercloud';
import path from 'path';

const page = new Page('hypercloud_404');

page.template.path.set(path.resolve(__dirname, 'hypercloud_404.ejs'));
page.stylesheets.link.internal(path.resolve(__dirname, 'style.css'));

page.title.multilingual.set({
    default: 'Not Found 404',
    en: 'Not Found 404',
    ar: 'غير موجود 404'
})

page.description.multilingual.set({
    default: 'The page or resource was not found',
    en: 'The page or resource was not found',
    ar: 'لم يتم العثور على الصفحة المطلوبة'
})

const defaultLocals = {
    title: '404 - Page Not Found',
    subtitle: 'Oops. Looks like you took a wrong turn.',
    homeBtnLabel: 'HOME'
}

page.locals.multilingual.set({
    default: defaultLocals,
    en: defaultLocals,
    ar: {
        title: 'غير موجود - 404',                       // The page title in browsers,
        subtitle: 'لم يتم العثور على هذه الصفحة',      // The page title to render for visitors
        homeBtnLabel: 'الرئيسية'
    }
})

export default page;