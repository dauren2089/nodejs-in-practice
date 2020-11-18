const express = require('express');
const fs = require('fs');
// Установка Formidable для загрузки файлов
const formidable = require('formidable' );

// Установка механизма представления handlebars
const handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' });
const app = express();

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

app.get('/', function (req, res){
    // res.type('text/plain');
    // res.send('Home Page');
    res.render('home');
});

// Маршрут GET для страницы загрузки фото и файлов
app.get('/contest/vacation-photo', function(req, res){
    const now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),month: now. getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Упс!',
                message: 'Во время обработки отправленной Вами формы ' +
                'произошла ошибка. Пожалуйста, попробуйте еще раз.',
            };
            return res.redirect(303, '/contest/vacation-photo');
        }
        var photo = files.photo;
        var dir = vacationPhotoDir + '/' + Date.now();
        var path = dir + '/' + photo.name;
        fs.mkdirSync(dir);
        fs.renameSync(photo.path, dir + '/' + photo.name);
        saveContestEntry('vacation-photo', fields.email,
            req.params.year, req.params.month, path);
        req.session.flash = {
            type: 'success',
            intro: 'Удачи!',
            message: 'Вы стали участником конкурса.',
        };
        return res.redirect(303, '/contest/vacation-photo/entries');
    });
});

//Маршрут POST метод для получения файлов
// app.post('/contest/vacation-photo/:year/:month' , function(req, res){
//     const form = new formidable. IncomingForm();
//     form.parse(req, function(err, fields, files){
//         if(err) return res.redirect(303, '/error' );
//         console.log('received fields:' );
//         console.log(fields);
//         console.log('received files:' );
//         console.log(files);
//         res.redirect(303, '/thank-you' );
//     });
// });

// обработка страниц 404
app.use(function (req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Не найдено!');
});

// прослушивание порта 3000
app.listen(app.get('port'), function (){
    console.log('Express запущен на http://localhost:'+
        app.get('port') + ': нажмите Ctrl + C для завершения.');
});