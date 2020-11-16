# NODE JS конспекты
## Для установки экспресс:
```sh
$ npm install --save express
```

app.get — метод, с помощью которого мы добавляем маршруты.

Добавим маршруты для домашней страницы:
```js
app.get('/', function(req, res){
 res.type('text/plain');
 res.send('Meadowlark Travel');
});
```

Этот метод (app.get) принимает 
два параметра: путь и функцию.
Путь — то, что определяет маршрут. 
Созданная вами функция будет вызываться при совпадении маршрута. Передаваемые этой функции параметры — объекты запроса и ответа (req, res).

Express также предоставляет нам для 
удобства метод res.type, устанавливающий заголовок Content-Type.

app.use — метод, с помощью которого Express добавляет промежуточное ПО.

в Express порядок добавления маршрутов и промежуточного ПО имеет значение. Если мы 
вставим обработчик 404 перед маршрутами, домашняя страница (/) и страница (/about) перестанут функционировать, вместо этого их URL будут приводить к странице 404.
```js
//страница about
app.get('/about', function(req, res){
 res.type('text/plain');
 res.send('О Meadowlark Travel');
});
```
```js
// пользовательская страница 404
app.use(function(req, res, next){
 res.type('text/plain');
 res.status(404);
 res.send('404 — Не найдено');
});
```
Важен порядок добавления методов app.verbs и app.use!

Установка handlebars:
```sh
$ npm install --save express-handlebars
```
Инициализация handlebars в app.js:
```js
var app = express();
// Установка механизма представления handlebars
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
```
Это создает механизм представления и настраивает Express для его использо-
вания по умолчанию.

(defaultLayout:'main') - указываем макет по 
умолчанию. Это значит, что, если вы не укажете иное, для 
любого представления будет использоваться этот макет.

 Создадим шаблон для нашего сайта. Создайте файл  views/layouts/main.handlebars:
```html
<!doctype html>
<html>
<head>
 <title>Meadowlark Travel</title>
</head>
<body>
 {{{body}}}
</body>
</html>
```
Теперь создадим страницы представления для нашей домашней страницы, views/
home.handlebars:
```html
<h1>Добро пожаловать в Meadowlark Travel</h1>
```

Затем для страницы О..., views/about.handlebars:
```html
<h1>О Meadowlark Travel</h1>
```
Затем для страницы Не найдено, views/404.handlebars:
```html
<h1>404 — Не найдено</h1>
```
И наконец, для страницы Ошибка сервера, views/500.handlebars:
```html
<h1>500 - Server Error</h1>
```
Теперь, когда мы установили представления, необходимо заменить старые 
маршруты новыми, использующими эти представления:
```js
app.get('/', function(req, res) {
 res.render('home');
});

app.get('/about', function(req, res) {
 res.render('about');
});

// Обобщенный обработчик 404 (промежуточное ПО)
app.use(function(req, res, next){
 res.status(404);
 res.render('404');
});
```
Обратите внимание, мы заменили res.send() на res.render(), так как теперь мы пересылаем на страницу в папке view. А Метод send - отправлял текстовое сообщение!

Статические файлы и представления
При обработке статических файлов и представлений Express полагается на промежуточное ПО. Промежуточное ПО  обеспечивает разбиение на модули, упрощая обработку запросов.
Промежуточное ПО static позволяет вам объявлять один из каталогов как содержащий статические ресурсы, которые довольно просты для того, чтобы их можно 
было выдавать пользователю без какой-либо особой обработки. Именно сюда вы 
можете поместить картинки, файлы CSS и клиентские файлы на JavaScript.

Создайте подкаталог с именем /public.

Перед объявлением маршрутов добавьте промежуточное ПО static:
```js
app.use(express.static(__dirname + '/public'));
```
Теперь мы просто можем сослаться на /img/logo.png
```html
<body>
 <header><img src="/img/logo.png" alt="Логотип Meadowlark Travel"></header>
 {{{body}}}
</body>
```

## Страничное тестирование
Установка mocha:
```sh
$ npm install --save-dev mocha
```
Поскольку мы будем запускать Mocha в браузере, необходимо выложить его 
ресурсы в общедоступную папку, чтобы они могли быть выданы клиенту. Мы поместим их в подкаталог public/vendor:
```sh
$ mkdir public/vendor
$ cp node_modules/mocha/mocha.js public/vendor
$ cp node_modules/mocha/mocha.css public/vendor
```
Тестам обычно требуется функция assert (или expect). Она доступна во фреймворке Node, 
но не внутри браузера, так что мы будем пользоваться библиотекой утверждений Chai:
```sh
$ npm install --save-dev chai
$ cp node_modules/chai/chai.js public/vendor
```
Тесты должны быть отключены по умолчанию, но с возможностью очень удобной их 
активации. Чтобы достичь обеих этих целей, используем параметр URL для активации 
тестов. После этого переход на http://localhost:3000 будет загружать домашнюю страницу, а переход на http://localhost:3000?test=1 — домашнюю страницу вместе с тестами.

Мы собираемся использовать промежуточное ПО для распознания test=1 в строке запроса. Оно должно находиться перед определениями любых маршрутов, 
в которых мы хотели бы его использовать:
```js
app.use(function(req, res, next){
 res.locals.showTests = app.get('env') !== 'production' &&
 req.query.test === '1';
 next();
});
// Здесь находятся маршруты...
```
Теперь мы можем изменить views/layouts/main.handlebars для включения тестового фреймворка в зависимости от условия. Изменяем раздел <head>:
```html
<head>
 <title>Meadowlark Travel</title>
 {{#if showTests}}
 <link rel="stylesheet" href="/vendor/mocha.css">
{{/if}}
 <script src="//code.jquery.com/jquery-2.0.2.min.js"></script>
</head>
```
Затем прямо перед закрывающим тегом </body>:
```html
{{#if showTests}}
 <div id="mocha"></div>
 <script src="/vendor/mocha.js"></script>
 <script src="/vendor/chai.js"></script>
 <script>
 mocha.ui('tdd');
 var assert = chai.assert;
 </script>
 <script src="/qa/tests-global.js"></script>
 {{#if pageTestScript}}
 <script src="{{pageTestScript}}"></script>
 {{/if}}
 <script>mocha.run();</script>
 {{/if}}
</body>
```

Создадим директорию public/qa, а в ней файл tests-global.js: 
```js
suite('Global Tests', function(){
    test('У данной страницы допустимый заголовок', function(){
        assert(document.title && document.title
            .match(/\S/) &&
            document.title.toUpperCase() !== 'TODO');
    });
});
```

Зайдите на домашнюю страницу и посмотрите на ее исходный код. Вы не увидите никаких признаков кода тестов. Теперь добавьте test=1 в строку запроса (http://localhost:3000/?test=1), и вы увидите выполняемые на странице тесты.



## Межстраничное тестирование

Создадим страницу тура views/tours/hood-river.handlebars:
```html
<h1>Тур по реке Худ</h1>

<a class="requestGroupRate"
   href="/tours/request-group-rate">Запрос цены для групп.</a>
````

И страницу расценок views/tours/request-group-rate.handlebars:

```html
<h1>Запрос цены для групп</h1>
<form>
    <input type="hidden" name="referrer">
    Название:
    <input type="text" id="fieldName" name="name">
    <br>
    Размер группы:
    <input type="text" name="groupSize">
    <br>        Электронная почта:
    <input type="email" name="email">
    <br>
    <input type="submit" value="Submit">
</form>
{{#section 'jquery'}}
    <script>
        $(document).ready(function(){
            $('input[name="referrer"]')
                    .val(document.referrer);
        });
    </script>
{{/section}}
```

Затем создадим маршруты для этих страниц в app.js: 
```js
app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river')
});

app.get('/tours/request-group-rate', function (req, res){
    res.render('tours/request-group-rate');
});
```

Сначала установим Zombie или рекомендую вам попробовать Selenium или PhantomJS:
```sh
npm install --save-dev zombie
```

Теперь создадим новый каталог с названием просто qa 

 В этом каталоге создадим файл qa/tests-crosspage.js: 
```js
const Browser = require('zombie'),
assert = require('chai').assert;
const browser;
suite('Межстраничные тесты', function(){
	setup(function(){
		browser = new Browser();    
	});
    
    test('запрос расценок для групп со страницы туров по реке Худ' + 
    	'должен заполнять поле реферера', function(done){
    		const referrer = 'http://localhost:3000/tours/hood-river';
    		browser.visit(referrer, function(){
    			browser.clickLink('.requestGroupRate', function(){
    				assert(browser.field('referrer').value === referrer);done();            
    			});        
    		});    
    	});
   });
```

## Логическое тестирование

 Создайте файл qa/tests-unit.js: 
```js
var fortune = require('../lib/fortune.js'); 
var expect = require('chai').expect;

suite('Тесты печений-предсказаний', function(){
    test('getFortune() должна возвращать предсказание', function(){        expect(typeof fortune.getFortune() === 'string');
        });
	}); 
```

Теперь можно просто запустить Mocha на этом новом наборе тестов: 
```sh
mocha -u tdd -R spec qa/tests-unit.js
```


## Линтинг
JSHint можно очень легко получить с помощью npm:
```sh
npm install -g jshint 
```

Чтобы запустить его, просто вызовите его с именем файла исходного кода: 
```sh
jshint app.js 
```

## Автоматизация с помощью Grunt
Вначале нужно будет установить утилиту командной строки Grunt и сам Grunt: 
```sh
sudo npm install -g grunt-cli 
```
```sh
npm install --save-dev grunt
```

устанавливаем все нужные плагины:
```sh
npm install --save-dev grunt-cafe-mocha
npm install --save-dev grunt-contrib-jshint 
npm install --save-dev grunt-exec
```
Теперь, когда плагины установлены, создайте в своем каталоге проекта файл с названием Gruntfile.js: 
```js
module.exports = function(grunt){
	// Загружаем плагины
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });
    // Настраиваем плагины
    grunt.initConfig({
        cafemocha: {
            all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
        },
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js','lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        exec: {
            linkchecker:
                { cmd: 'linkchecker http://localhost:3000' }
        },
    });
    // Регистрируем задания
    grunt.registerTask('default', ['cafemocha','jshint','exec']);
};
```

Теперь все, что осталось сделать, — убедиться, что сервер запущен (в фоновом режиме или отдельном окне), и запустить Grunt:
```sh
$ grunt
```
Все ваши тесты, за исключением страничных, будут запущены, весь ваш код будет проанализирован линтером, и все ссылки проверены! Если какой-либо из компонентов выполнится неуспешно, Grunt завершится с сообщением об ошибGrunt завершится с сообщением об ошиб завершится с сообщением об ошибке; в противном случае он сообщит: Выполнено, без ошибок (Done, without errors). Нет ничего приятнее, чем видеть это сообщение, так что заведите привычку запускать Grunt до того, как зафиксировать изменения!

## Непрерывная интеграция

По сути, CI запускает все ваши тесты или их часть всякий раз, когда вы вносите код на общий сервер.

В настоящее время наиболее распространенный сервер CI для проектов Node — Travis CI. Travis CI — решение, располагающееся на внешнем сервере, что может оказаться весьма привлекательным, так как освобождает вас от необходимости настраивать собственный сервер CI. Оно предлагает великолепную поддержку интеграции для использующих GitHub. Плагин для Node есть также у известного сервера CI Jenkins. Предлагает плагины для Node сейчас и прекрасный TeamCity от компании JetBrains.


## Объекты запроса и ответа

Когда вы создаете веб-сервер с помощью Express, большая часть ваших действий начинается с объекта запроса и заканчивается объектом ответа. 

Протокол HTTP определяет набор методов запроса (часто называемых также глаголами HTTP), используемых клиентом для связи с сервером. Несомненно, наиболее распространенные методы — GET и POST. 

### Заголовки запроса
URL — не единственная вещь, передаваемая серверу, когда вы заходите на страницу.

Вся эта информация отправляется в виде заголовка запроса, что возможно благодаря свойству headers объекта запроса.

Если вам интересно посмотреть, какую информацию отправляет ваш браузер, можете создать простейший маршрут Express для отображения этой информации: 
```js
app.get('/headers', function(req,res){
    res.set('Content-Type','text/plain');
    let s = '';
    for(let name in req.headers)
        s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});
```

Очень заботящиеся о своей безопасности серверы часто опускают эту информацию или даже посылают ложные сведения о себе. Отключить заголовок Express по умолчанию X-Powered-By несложно:
```js
app.disable('x-powered-by');
```

## Визуализация контента
При визуализации контента чаще всего вы будете использовать res.render, визуализирующий представления в макетах, обеспечивая наилучшие характеристики. 

Время от времени вы можете захотеть написать страницу для тестирования побыстрому, так что можете использовать res.send, если нужна просто тестовая страница.

Вы можете использовать req.query для получения значений строки запроса, req.session — для получения значений сеансовых переменных или req.cookie/ req.signedCookies — для получения куки-файлов.

### Стандартное использование: 
```js
// стандартное использование 
app.get('/about', function(req, res){
    res.render('about'); 
});
```
### Отличные от 200 коды ответа 
```js
app.get('/error', function(req, res){
    res.status(500);
    res.render('error');
});
 // или в одну строку ...
app.get('/error', function(req, res){
    res.status(500).render('error');
}); 
```
### Передача контекста представлению, включая строку запроса, куки-файлы и значения сеансовых переменных 

```js
app.get('/greeting', function(req, res){
    res.render('about', {
    	message: 'welcome',
		style: req.query.style,
        userid: req.cookie.userid,
        username: req.session.username,
    });
});
```

### Визуализация представления без макета
```js
// у следующего макета нет файла макета, так что 
// views/no-layout.handlebars должен включать весь необходимый 
// HTML 
app.get('/no-layout', function(req, res){
	res.render('no-layout', { layout: null });
});
```

### Визуализация представления с пользовательским макетом
```js
// будет использоваться файл макета 
// views/layouts/custom.handlebars 
app.get('/custom-layout', function(req, res){
	res.render('custom-layout', { layout: 'custom' });
}); 
```

###  Визуализация неформатированного текстового вывода
```js
app.get('/test', function(req, res){
	res.type('text/plain');
    res.send('это текст сообщения');
}); 
```

### Добавление обработчика ошибок
```js
// это должно находиться ПОСЛЕ всех ваших маршрутов
// обратите внимание на то, что, даже если вам 
// не нужна функция "next",
// она должна быть включена, чтобы Express
// распознал это как обработчик ошибок
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).render('error'); });
```

### Добавление обработчика кода состояния 404 
```js
// это должно находиться ПОСЛЕ всех ваших 
// маршрутов 
app.use(function(req, res){
	res.status(404).render('not-found');
});
```

## Обработка форм
При обработке форм информация из них обычно находится в req.body (иногда в req.query). Вы можете использовать req.xhr, чтобы выяснить, был ли это AJAX-запрос или запрос браузера.

###  Стандартная обработка формы 
```js
// должно быть скомпоновано промежуточное ПО body-parser
app.post('/process-contact', function(req, res){
    console.log('Получен контакт от ' 
    	+ req.body.name +' <' + req.body.email + '>');    
	// сохраняем в базу данных...
    res.redirect(303, '/thank-you');
});
```

###  Более устойчивая к ошибкам обработка формы
```js
// должно быть скомпоновано промежуточное ПО body-parser
app.post('/process-contact', function(req, res){
    console.log(' Получен контакт от ' + req.body.name + ' <'
     + req.body.email + '>');
	try {        
		// сохраняем в базу данных...
		return res.xhr ? 
        res.render({ success: true }) :
        res.redirect(303, '/thank-you');
    } catch(ex) {
        return res.xhr ?
        res.json({ error: 'Ошибка базы данных.' }) :
        res.redirect(303, '/database-error');
    } 
});
```

## Предоставление API
Когда вы предоставляете API, то, аналогично обработке форм, параметры обычно находятся в req.query, хотя вы можете также использовать req.body. Чем случай с API отличается, так это тем, что вы обычно будете вместо HTML возвращать JSON, XML или даже неформатированный текст и будете часто использовать менее распространенные методы HTTP, такие как PUT, POST и DELETE. 

Термин "конечная точка" (endpoint) часто используется для описания отдельной функции API.

Массив продуктов, который при будет извлекаться из базы данных: 
```js
var tours = [    
	{ id: 0, name: 'Река Худ', price: 99.99 },
    { id: 1, name: 'Орегон Коуст', price: 149.95 },
];
```

### Простая конечная точка GET, возвращающая только JSON
```js
app.get('/api/tours', function(req, res){
	res.json(tours);
});
```

### Простая конечная точка GET, возвращающая JSON, XML или текст 
```js
app.get('/api/tours', function(req, res){
    var toursXml = '<?xml version="1.0"?><tours>' + 
		products.map( function(p){
		    return '<tour price="' + p.price +
		        '" id="' + p.id + '">' + p.name + '</tour>';
		}).join('') + '</tours>';
    var toursText = tours.map(function(p){
        return p.id + ': ' + p.name + ' (' + p.price + ')';
            }).join('\n');    
    res.format({
        'application/json': function(){
	        res.json(tours);
        },
        'application/xml': function(){
            res.type('application/xml');
            res.send(toursXml);
        },
        'text/xml': function(){
            res.type('text/xml');
            res.send(toursXml);
        }
        'text/plain': function(){
            res.type('text/plain');
            res.send(toursXml);
        }
	});
});
```

### Конечная точка PUT для изменения 
Конечная точка PUT меняет продукт и возвращает JSON. Параметры передаются в строке запроса (":id" в строке маршрута приказывает Express добавить свойство id к req.params). 

```js
// API, меняющее тур и возвращающее JSON; 
// параметры передаются с помощью строки запроса 
app.put('/api/tour/:id', function(req, res){
	var p = tours.filter(function(p){
		return p.id === req.params.id })[0];
		    if( p ) {        
		    	if( req.query.name ) p.name = req.query.name;        if( req.query.price ) p.price = req.query.price;	res.json({success: true});    
		    } else {
	            res.json({error: 'Такого тура не существует.'});
            }
});
```

### Конечная точка DEL для удаления
```js
// API, удаляющее продукт 
api.del('/api/tour/:id', function(req, res){
	let i;
    for( let i=tours.length-1; i>=0; i-- )
        if( tours[i].id == req.params.id ) break;
    if( i>=0 ) {
	    tours.splice(i, 1);
        res.json({success: true});
    } else {
        res.json({error: 'Такого тура не существует.'});
    } 
});
```

## Основы Handlebars
Handlebars — расширение Mustache, еще одного распространенного шаблониза, еще одного распространенного шаблонизатора.

Ключ к пониманию шаблонизации — понимание концепции контекста. Когда вы визуализируете шаблон, вы передаете шаблонизатору объект, который называется контекстным объектом, что и обеспечивает работу подстановок. 

Например, если мой контекстный объект { name: 'Лютик' }, а шаблон — "Привет, {{name}}",то {{name}} будет заменено на Лютик.

### Блоки
Блоки обеспечивают управление обменом данными, условное выполнение и расширяемость. Рассмотрим следующий контекстный объект:
```js
{    
	currency: {        
		name: 'Доллары США',
        abbrev: 'USD',
},
    tours: [
        { name: 'Река Худ', price: '$99.95' },
        { name: 'Орегон Коуст', price: '$159.95' },
    ],    
    specialsUrl: '/january-specials',
    currencies: [
    	'USD',
    	'GBP',
   		'BTC' ],
} 
```

Шаблон, которому мы можем этот контекст передать:
```
<ul>    
	{{#each tours}}
	    {{! Я в новом блоке... и контекст изменился }}
        <li>
	        {{name}} - {{price}}
            {{#if ../currencies}}
	            ({{../../currency.abbrev}})
            {{/if}}
        </li>
    {{/each}}
</ul>
{{#unless currencies}}    
	<p>Все цены в {{currency.name}}.</p>
{{/unless}} 
```

Помимо скрытия подробностей реализации, серверные шаблоны поддерживают кэширование шаблонов, играющее важную роль в обеспечении производительности. Шаблонизатор кэширует скомпилированные шаблоны (перекомпилируя и кэшируя заново только при изменении самого шаблона), что повышает производительность шаблонизированных представлений. 

По умолчанию кэширование представлений отключено в режиме разработки и включено в эксплуатационном режиме. Явным образом активировать кэширование представлений, если захотите, вы можете следующим образом:
```js
app.set('view cache', true);
```

## Использование макетов в Express
При создании шаблонизатора задаем имя макета по умолчанию: 
```js
var handlebars = require('express-handlebars')
	.create({ defaultLayout: 'main' }); 
```
По умолчанию Express ищет представления в подкаталоге views, а макеты — в подкаталоге layouts. Так что, если у вас есть представление views/foo.handlebars, можете его визуализировать следующим образом: 
```js
app.get('/foo', function(req, res){    
	res.render('foo'); 
}); 
```

В качестве макета при этом будет использоваться views/layouts/main.handlebars. 

Если будет необходимо использовать другой шаблон, можете указать имя шаблона: 
```js
app.get('/foo', function(req, res){    
	res.render('foo', 
		{ layout: 'microsite' });
});
```

При этом будет визуализироваться представление с макетом views/layouts/ microsite.handlebars. 

## Обработка форм
Наиболее распространенным способом сбора информации у ваших пользователей является использование HTML-форм. 
Вне зависимости от того, позволяете ли вы браузеру подать форму обычным путем или применяете AJAX или модные контролы на клиентской стороне, базовым механизмом по-прежнему остается HTMLформа.

### Отправка данных с клиентской стороны на сервер
Есть два способа отправить данные с клиентской стороны на сервер: через строку запроса и тело запроса. Как правило, если вы используете строку запроса, вы создаете GET-запрос, а если применяете тело — то POST-запрос.

#### HTML-формы
Простой пример как создаются HTML-формы:
```html
<form action="/process" method="POST" >
	<input type="hidden" name="hush" 
		val="Скрытое, но не секретное!" >
    <div>
    	<label for="fieldColor" >Ваш любимый цвет: </label>
        <input type="text" id="fieldColor" name="color" >
    </div>
    <div>
        <button type="submit" >Отправить</button>    
    </div>
</form> 
```

Обратите внимание на то, что метод определяется явным образом как POST в теге <form>; 
Eсли вы этого не делаете, по умолчанию используется GET

Атрибут action (действие) определяет URL, который получит форму, когда она будет отправлена. Если вы опускаете это поле, она будет подана к тому же URL, с которого была загружена.

Рекомендуется всегда обеспечивать актуальное действие (action), даже если вы используете AJAX, — это поможет предотвратить потерю данных. 

С точки зрения сервера важный атрибут в полях input — это имя атрибута: именно по нему сервер определяет поле. Очень важно понимать, что имя атрибута отличается от идентификатора атрибута, который следует использовать только для стилизации и обеспечения должного функционирования клиентской стороны (на сервер он не передается).

Если у вас на странице предполагаются два разных действия, используйте две разные формы. Примером этого могут быть наличие формы для поиска по сайту и отдельная форма для подписки на рассылку новостей. Вы можете использовать одну большую форму и определять, какое действие предпринимать, основываясь на том, какую кнопку нажал пользователь.

Когда пользователь отправляет форму, вызывается URL /process и значения полей отправляются на сервер в теле запроса.


### Обработка форм посредством Express

Если вы используете GET-запрос для обработки формы, поля будут доступны как объект req.query. К примеру, если у вас есть поле ввода запросов HTML с атрибутом имени email, его значение будет отправлено обработчику как req.query.email.

Если вы используете POST, то должны выбирать промежуточное ПО для того, чтобы разобрать URL-закодированное тело. Прежде всего установите программу body-parser:
```sh
npm install -save body-parser
```

Затем привяжитесь к ней: 
```js
app.use(require('body-parser').urlencoded({ extended: true }));
```

Привязав body-parser, вы увидите, что req.body станет доступным для вас, таким образом доступными станут и поля формы. Обратите внимание на то, что req.body не препятствует использованию строки запросов.

Пойдем дальше и добавим форму, позволяющую пользователю подписаться на почтовую рассылку. С целью демонстрации будем использовать строку запросов, скрытое поле и видимые поля во /views/newsletter.handlebars:
```
<h2>Подпишитесь на нашу рассылку для получения новостей и специальных предложений!</h2>
<form class="form-horizontal" role="form"
      action="/process?form=newsletter" method="POST" >
	<input type="hidden" name="_csrf" value="{{csrf}}" >
    <div class="form-group" >
    	<label for="fieldName" class="col-sm-2 control-label" >Имя</label>
        <div class="col-sm-4" >
        	<input type="text" class="form-control"
            	id="fieldName" name="name" >
        </div>
    </div>
   	<div class="form-group" >
		<label for="fieldEmail" class="col-sm-2 control-label" >Электронный адрес </label>
		<div class="col-sm-4" >
			<input type="email" class="form-control" required           id="fieldEmail" name="email" >
		</div>
	</div>
    <div class="form-group" >
        <div class="col-sm-offset-2 col-sm-4" >
            <button type="submit" class="btn btn-default" >Зарегистрироваться</button>        	
        </div>
    </div>
</form>
```
Файл приложения:
```js
app.use(require('body-parser'). urlencoded({ extended: true }));
app.get('/newsletter', function(req, res){    
	// мы изучим CSRF позже... сейчас мы лишь
	// заполняем фиктивное значение
	res.render('newsletter', { csrf: 'CSRF token goes here' }); 
});

app.post('/process' , function(req, res){    console.log('Form (from querystring): ' + req.query. form); 
	console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	console.log('Name (from visible form field): ' + req.body.name);    
	console.log('Email (from visible form field): ' + req.body.email); 
	res.redirect(303, '/thank-you' ); 
});
```
Здесь все, что для этого нужно. Обратите внимание на то, что в обработчике мы перенаправляем на просмотр «Thank you». Мы могли бы передать просмотр сюда, но если бы сделали это, поле URL в браузере посетителя осталось бы /process, что могло бы сбить с толку; перенаправление решает эту проблему.

Express предоставляет нам два удобных свойства: req.xhr и req.accepts. req.xhr будет true, если запрос будет в запросе AJAX (XHR — это сокращение от XML HTTP Request, на который полагается AJAX). req.accepts будет пытаться определить наиболее подходящий тип возвращаемого ответа. В нашем случае req.accepts('json,html') спрашивает, какой формат будет лучшим форматом для возврата, JSON или HTML. Вывод делается, исходя из Accepts-заголовка HTTP, что является пронумерованным списком допустимых типов ответа, предоставляемых браузером. Если запрос выполняется AJAX или пользовательский агент явным образом указал, что JSON будет лучше, чем HTML, будет возвращен соответствующий JSON, в противном случае вернется перенаправление. 


## Загрузка файлов на сервер
Создадим форму загрузки файла на сервер для фотоконкурса Meadowlark Travel
vacation (views/contest/vacation-photo.handlebars):

```html
<form class="form-horizontal" role="form"
 enctype="multipart/form-data" method="POST"
 action="/contest/vacation-photo/{year}/{month}">
	 <div class="form-group">
	 	<label for="fieldName" class="col-sm-2 control-label" >Имя</label>
	 	<div class="col-sm-4">
			 <input type="text" class="form-control"
	 			id="fieldName" name="name">
	 	</div>
	 </div>
	 <div class="form-group">
	 	<label for="fieldEmail" class="col-sm-2 control-label" >Адрес электронной
			почты</label>
	 	<div class="col-sm-4">
	 		<input type="email" class="form-control" required
	 			id="fieldEmail" name="email">
	 	</div>
	 </div>
	 <div class="form-group">
	 	<label for="fieldPhoto" class="col-sm-2 control-label"
	 		>Фотография из отпуска </label>
	 	<div class="col-sm-4" >
			<input type="file" class="form-control" required accept="image/*"
	 		id="fieldPhoto" name="photo">
	 	</div>
	 </div>
	 <div class="form-group" >
	 	<div class="col-sm-offset-2 col-sm-4">
	 		<button type="submit" class="btn btn-primary">Отправить</button>
	 	</div>
	</div>
</form>
```
Обратите внимание на то, что мы указываем enctype="multipart/form-data" для
разрешения загрузки файлов на сервер. Мы также ограничиваем типы файлов,
которые могут быть загружены, использованием разрешительных атрибутов 

 установим Formidable 
```sh
$ npm install --save formidable
 ```

 и создадим следующие обработчики путей:
```js
const formidable = require('formidable' );

app.get('/contest/vacation-photo', function(req, res){
	const now = new Date();
	res.render('contest/vacation-photo', {
 		year: now.getFullYear(),month: now. getMonth()
 	});
});

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
```

Продолжим — запустим это и изучим журнал консоли. Вы увидите, что поля форм будут показаны вам, как вы и предполагали, как объект со свойствами, соответствующими именам ваших полей. Объект файлов содержит больше данных, но он относительно простой. Для каждого загруженного файла вы увидите свойства размера, пути, в который он был загружен (обычно это случайное имя во временном каталоге), и первоначальное название файла, который пользователь загрузил на сервер (просто имя файла, не полный путь, из соображений безопасности и приватности).

## Cookie-файлы  и сеансы
HTTP — протокол без сохранения состояния. Это означает, что, когда вы загружаете страницу в своем браузере и затем переходите на другую страницу того же сайта, ни у сервера, ни у браузера нет никакой внутренней возможности знать, что это тот же браузер посещает тот же сайт. Другими словами, Интернет работает таким образом, что каждый HTTP-запрос содержит всю информацию, необходимую серверу для удовлетворения этого запроса. 

Однако тут есть проблема: если бы на этом все заканчивалось, мы никогда не смогли бы войти ни на один сайт. Потоковое видео не работало бы. Сайты забывали бы ваши настройки при переходе с одной страницы на другую. Так что обязан существовать способ формирования состояния поверх HTTP, и тут-то в кадре появляются cookie-файлы и сеансы.

Идея cookie-файла проста: сервер отправляет фрагмент информации, который браузер хранит на протяжении настраиваемого промежутка времени. Содержание этого фрагмента информации полностью зависит от сервера: часто это просто уникальный идентификационный номер (ID), соответствующий конкретному браузеру, так что поддерживается определенная имитация сохранения состояния. 

Cookie-файлы не магия: когда сервер хочет сохранить на клиенте cookie-файл, он отправляет заголовок Set-Cookie, содержащий пары «имя/значение»; а когда клиент отправляет запрос серверу, от которого он получил cookie-файлы, он отправляет многочисленные заголовки запроса Cookie, содержащие значения cookie-файлов.

### Экспорт учетных данных
Для безопасности использования cookie-файлов необходим так называемый секрет cookie. Секрет cookie-файла представляет собой строку, известную серверу и используемую для шифрования защищенных cookie-файлов перед их отправкой клиенту. Это не пароль, который необходимо помнить, так что он может быть просто случайной строкой.

Экспорт сторонних данных для доступа, таких как секрет cookie-файла, базам данных и маркеры доступа к API (Twitter, Facebook и т. п.), является распространенной практикой. Это не только облегчает сопровождение (путем упрощения нахождения и обновления учетных данных), но и позволяет вам исключить файл с учетными данными из системы контроля версий, что особенно критично для репозиториев с открытым исходных кодом, размещаемых в GitHub или других общедоступных репозиториях исходного кода.

Для этого мы будем экспортировать наши учетные данные в файл JavaScript.
Создайте файл credentials.js:
```js
module.exports = {
 cookieSecret: 'здесь находится ваш секрет cookie-файла ',
};
```
