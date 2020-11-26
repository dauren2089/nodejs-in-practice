const express = require('express');
// Установка Formidable для загрузки файлов
const formidable = require('formidable' );
const fs = require('fs');


const addRoute = require('./routes/add');
const coursesRoute = require('./routes/courses');

// Установка механизма представления handlebars
const handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' });

const fortune = require('./lib/fortune.js');
let cookieSecret = 'secretString';
const app = express();
// установка body-parser-а для получения POST запросов
app.use(require('body-parser'). urlencoded({ extended: true }));

//подключим express-session
app.use(require('cookie-parser')(cookieSecret));

app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: cookieSecret,
}));
// Инициализация движка handlebars
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

// Проверяем, существует ли каталог
const dataDir = __dirname + '/data';
const vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);
function saveContestEntry(contestName, email, year, month, photoPath){
    // TODO... это будет добавлено позднее
}

//Промежуточное ПО для распознания test=1 в строке запроса.
//Оно должно находиться перед определениями любых маршрутов, в которых мы хотели бы его использовать
app.use(function (req, res, next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.use(function(req, res, next){
    // Если имеется экстренное сообщение,
    // переместим его в контекст, а затем удалим
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use('/add', addRoute);
app.use('/courses', coursesRoute);

app.get('/', function (req, res){
    // res.type('text/plain');
    // res.send('Home Page');
    const cluster = require('cluster');
    if(cluster.isWorker) console.log('Исполнитель %d получил запрос',
        cluster.worker.id);
    res.render('home');
});

app.get('/headers', function(req,res){
    res.set('Content-Type','text/plain');
    let s = '';
    for(let name in req.headers)
        s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/about', function (req, res){
    // res.type('text/plain');
    // res.send('About page');
    res.render('about', {
        fortune:  fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});
// маршруты GET для страниц hood-river и request-group-rate
app.get('/tours/hood-river', function (req, res){
    res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function (req, res){
    res.render('tours/request-group-rate');
});
// Маршрут GET для страницы с формой по отправке POST запросов
app.get('/newsletter', function(req, res){
    // мы изучим CSRF позже... сейчас мы лишь
    // заполняем фиктивное значение
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
// Маршрут POST запрос с контекстом из форм
// app.post('/process' , function(req, res){
//     console.log('Form (from querystring): ' + req.query. form);
//     console.log('CSRF token (from hidden form field): ' + req.body._csrf);
//     console.log('Name (from visible form field): ' + req.body.name);
//     console.log('Email (from visible form field): ' + req.body.email);
//     res.redirect(303, '/thank-you' );
// });

// Немного измененная версия официального регулярного выражения
// W3C HTML5 для электронной почты:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
    '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
    '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');

app.post('/newsletter', function(req, res){
    let name = req.body.name || '', email = req.body.email || '';
    // Проверка вводимых данных
    if(!email.match(VALID_EMAIL_REGEX)) {
        if(req.xhr)
            return res.json({ error: 'Некорректный адрес электронной почты.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Ошибка проверки!',
            message: 'Введенный вами адрес электронной почты некорректен.',
        };
        return res.redirect(303, '/');
    }
    // NewsletterSignup — пример объекта, который вы могли бы
    // создать;поскольку все реализации различаются,
    // оставляю написание этих зависящих от
    // конкретного проекта интерфейсов на ваше
    // усмотрение. Это просто демонстрация того, как
    // типичная реализация на основе Express может
    // выглядеть в вашем проекте.
    new NewsletterSignup({ name: name, email: email }).save(function(err){
        if(err) {
            if(req.xhr)
                return res.json({ error: 'Ошибка базы данных.' });
            req.session.flash = {
                type: 'danger',
                intro: 'Ошибка базы данных!',
                message: 'Произошла ошибка базы данных. Пожалуйста, попробуйте позднее',
            }
            return res.redirect(303, '/');
        }
        if(req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: 'Спасибо!',
            message: 'Вы были подписаны на информационный бюллетень.',
        };
        return res.redirect(303, '/');
    });
});

// Маршрут GET для страницы загрузки фото и файлов
app.get('/contest/vacation-photo', function(req, res){
    const now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),month: now. getMonth()
    });
});
//Маршрут POST метод для получения файлов
app.post('/contest/vacation-photo/:year/:month' , function(req, res){
    const form = new formidable. IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error' );
        console.log('received fields:' );
        console.log(fields);
        console.log('received files:' );
        console.log(files);
        res.redirect(303, '/thank-you' );
    });
});
// app.post('/contest/vacation-photo/:year/:month', function(req, res){
//     const form = new formidable.IncomingForm();
//     form.parse(req, function(err, fields, files){
//         if(err) {
//             res.session.flash = {
//                 type: 'danger',
//                 intro: 'Упс!',
//                 message: 'Во время обработки отправленной Вами формы ' +
//                     'произошла ошибка. Пожалуйста, попробуйте еще раз.',
//             };
//             return res.redirect(303, '/contest/vacation-photo');
//         }
//         const photo = files.photo;
//         const dir = vacationPhotoDir + '/' + Date.now();
//         const path = dir + '/' + photo.name;
//         fs.mkdirSync(dir);
//         fs.renameSync(photo.path, dir + '/' + photo.name);
//         saveContestEntry('vacation-photo', fields.email,
//             req.params.year, req.params.month, path);
//         req.session.flash = {
//             type: 'success',
//             intro: 'Удачи!',
//             message: 'Вы стали участником конкурса.',
//         };
//         return res.redirect(303, '/contest/vacation-photo/entries');
//     });
// });
// проверка запуска кластеров
// app.use('/id', function(req,res,next){
//     const cluster = require('cluster');
//     if(cluster.isWorker) console.log('Исполнитель %d получил запрос',
//         cluster.worker.id);
// });

// обработка страниц 404
app.use(function (req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Не найдено!');
});
// прослушивание порта 3000
// app.listen(app.get('port'), function (){
//     console.log('Express запущен на http://localhost:'+
//         app.get('port') + ': нажмите Ctrl + C для завершения.');
// });
// функция позволяет быть включенным в качестве модуля посредством оператора require.
function startServer() {
    app.listen(app.get('port'), function() {
        console.log( 'Express запущен в режиме ' + app.get('env') +
            ' на http://localhost:' + app.get('port') +
            '; нажмите Ctrl+C для завершения.' );
    });
}
if(require.main === module){
    // Приложение запускается непосредственно;
    // запускаем сервер приложения
    startServer();
} else {
    // Приложение импортируется как модуль
    // посредством "require":
    // экспортируем функцию для создания сервера
    module.exports = startServer;
}