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

Экспорт сторонних данных для доступа, таких как секрет cookie-файла, паролик базам данных и маркеры доступа к API (Twitter, Facebook и т. п.), является распространенной практикой. Это не только облегчает сопровождение (путем упрощения нахождения и обновления учетных данных), но и позволяет вам исключить файл с учетными данными из системы контроля версий, что особенно критично для репозиториев с открытым исходных кодом, размещаемых в GitHub или других общедоступных репозиториях исходного кода.

Для этого мы будем экспортировать наши учетные данные в файл JavaScript.
Создайте файл credentials.js:
```js
module.exports = {
 cookieSecret: 'здесь находится ваш секрет cookie-файла ',
};
```

### Cookie-файлы в Express
Прежде чем устанавливать в своем приложении cookie-файлы и обращаться к ним,
вам необходимо включить промежуточное ПО cookie-parser. Сначала выполните
```sh
$ npm install --save cookie-parser
``` 
затем подключите в файле app.js:
```js
app.use(require('cookie-parser')(credentials.cookieSecret));
```

Как только вы это сделали, можете устанавливать cookie-файлы или подписанные cookie-файлы везде, где у вас только есть доступ к объекту ответа:
```js
res.cookie('monster', 'nom nom');
res.cookie('signed_monster', 'nom nom', { signed: true });
```

Подписанные cookie-файлы имеют приоритет перед неподписанными cookie-файлами. Если вы назовете ваш подписанный cookie-файл signed_monster, у вас не может быть неподписанного cookie-файл с таким же названием (он вернется как undefined).

Чтобы извлечь значение cookie-файла (если оно есть), отправленного с клиента, просто обратитесь к свойствам cookie или signedCookie объекта запроса:
```js
const monster = req.cookies.monster;
const signedMonster = req.signedCookies.signed_monster;
```
Вы можете использовать в качестве имени cookie любую строку, какую пожелаете. Например, мы могли указать 'signed monster' вместо 'signed_monster', но тогда пришлось бы использовать скобочную нотацию для извлечения cookie-файла: req.signedCookies['signed monster']. По этой причине я рекомендую использовать имена cookie-файлов без специальных символов.

Для удаления cookie-файла используйте req.clearCookie:
```js
res.clearCookie('monster');
```

При установке cookie-файла вы можете указать следующие опции.

> domain

Управляет доменами, с которыми связан cookie-файл, это позволяет привязывать cookie-файлы к конкретным поддоменам. Обратите внимание на то, что вы не можете установить cookie-файл для домена, отличного от того, на котором работает ваш сервер: он просто не будет выполнять каких-либо действий.

> path

Управляет путем, на который распространяется действие данного cookie-файла.
Обратите внимание на то, что в путях предполагается неявный метасимвол
в конце: если вы используете путь / (по умолчанию), он будет распространяться на все страницы вашего сайта. Если используете путь /foo, он будет распространяться на пути /foo, /foo/bar и т. д.

>maxAge

Определяет, сколько времени (в миллисекундах) клиент должен хранить cookieфайл до его удаления. Если вы опустите эту опцию, cookie-файл будет удален при закрытии браузера (можете также указать дату окончания срока действия cookie-файла, но синтаксис при этом удручающий. Я рекомендую использовать maxAge).

> secure

Указывает, что данный cookie-файл будет отправляться только через защищенное (HTTPS) соединение.

> httpOnly

Установка значения этого параметра в true указывает, что cookie-файл будет изменяться только сервером. То есть JavaScript на стороне клиента не может его изменять. Это помогает предотвращать XSS-атаки.

> signed

Установите в true, чтобы подписать данный cookie-файл, делая его доступным в res.signedCookies вместо res.cookies. Поддельные подписанные cookie-файлы будут отвергнуты сервером, а значение cookie-файла — возвращено к первоначальному значению.

### Сеансы
Сеансы — всего лишь более удобный способ сохранения состояния. Для реализации сеансов необходимо что-нибудь хранить на клиенте, в противном случае сервер не сможет распознать, что следующий запрос выполняет тот же клиент. Обычный способ для этого — cookie-файл, содержащий уникальный идентификатор. Сервер будет использовать этот идентификатор для извлечения информации о соответствующем сеансе.
HTML5 предоставляет другую возможность для сеансов — локальное хранилище.
Существует два способа реализации сеансов: хранить все в cookieфайле или хранить в cookie-файле только уникальный идентификатор, а все остальное — на сервере.

Для установки Cookie-session:
```sh
$ npm install --g cookie-session
```

### Хранилища в памяти
Установим express-session:
```sh
$ npm install --save express-session
```

Подключим express-session:
```js
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
 resave: false,
 saveUninitialized: false,
 secret: credentials.cookieSecret,
}));
```

Промежуточное ПО express-session принимает конфигурационный объект со
следующими опциями:

> resave

Заставляет сеанс заново сохраняться в хранилище, даже если запрос не менялся. Обычно предпочтительнее устанавливать этот параметр в false (см. документацию по express-session для получения дополнительной информации).

> saveUninitialized

Установка этого параметра в true приводит к сохранению новых (неинициализированных) сеансов в хранилище, даже если они не менялись. Обычно предпочтительнее (и даже необходимо, если вам требуется получить разрешение пользователя перед установкой cookie-файла) устанавливать этот параметр в false (см. документацию по express-session для получения дополнительной информации).

> secret

Ключ (или ключи), используемый для подписания cookie-файла идентификатора сеанса. Может быть тем же ключом, что и применяемый для cookie-parser.

> key

Имя cookie-файла, в котором будет храниться уникальный идентификатор сеанса. По умолчанию connect.sid.

> store

Экземпляр сеансового хранилища. По умолчанию это экземпляр MemoryStore,
что вполне подходит для наших текущих целей.

> cookie

Настройки для cookie-файла сеанса (path, domain, secure и т. д.). Применяются стандартные значения по умолчанию для cookie-файлов.

### Использование сеансов
Воспользуйтесь свойствами переменной session объекта запроса:
```js
req.session.userName = 'Anonymous';
var colorScheme = req.session.colorScheme || 'dark';
```

Обратите внимание на то, что при работе с сеансами нам не требуется использовать объект запроса для извлечения значения и объект ответа для задания значения — все это выполняет объект запроса (у объекта ответа нет свойства session).

Чтобы удалить сеанс, можно применить оператор JavaScript delete:
```js
req.session.userName = null; 
// Этот оператор устанавливает
// 'userName' в значение null, но не удаляет
delete req.session.colorScheme;
// а этот удаляет 'colorScheme'
```

### Использование сеансов для реализации экстренных сообщений
Экстренные сообщения — просто метод обеспечения обратной связи с пользователями таким способом, который не мешал бы их навигации.

Простейший метод реализации экстренных сообщений — использование сеансов (можно также задействовать строку запроса, но при этом не только будут возникать более уродливые URL, но и экстренные сообщения станут попадать в закладки браузера).

```html
 {{#if flash}}
 <div class="alert alert-dismissible alert-{{flash.type}}">
	 <button type="button" class="close"
	 	data-dismiss="alert" aria-hidden="true">&times;<button>
	 <strong>{{flash.intro}}</strong> 
	 {{{flash.message}}}
 </div>
{{/if}}
```

Добавьте такой код перед вашими маршрутами:
```js
app.use(function(req, res, next){
	 // Если имеется экстренное сообщение,
	 // переместим его в контекст, а затем удалим
	 res.locals.flash = req.session.flash;
	 delete req.session.flash;
	 next();
});
```
```js
// Немного измененная версия официального регулярного выражения
// W3C HTML5 для электронной почты:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
var VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
 '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
 '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');

app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
 	// Проверка вводимых данных
 	if(!email.match(VALID_EMAIL_REGEX)) {
 		if(req.xhr)
 		return res.json({ error: 'Некорректный адрес электронной почты.' });
	req.session.flash = {
 		type: 'danger',
 		intro: 'Ошибка проверки!',
 		message: 'Введенный вами адрес электронной почты некорректен.',
 	};
 	return res.redirect(303, '/newsletter/archive');
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
 		return res.redirect(303, '/newsletter/archive');
	}
 	if(req.xhr) return res.json({ success: true });
	req.session.flash = {
		type: 'success',
		intro: 'Спасибо!',
		message: 'Вы были подписаны на информационный бюллетень.',
 	};
 	return res.redirect(303, '/newsletter/archive');
	});
});
```

Экстренные сообщения — замечательный механизм для вашего сайта, даже если
другие методы лучше подходят для некоторых сфер (например, экстренные сообщения не всегда подходят для мастеров с несколькими формами или потоками подсчета стоимости в корзине для виртуальных покупок). Экстренные сообщения очень удобно использовать также во время разработки в качестве способа обеспечения обратной связи, даже если потом вы замените их на другой механизм.

Поскольку экстренное сообщение перемещается из сеанса в res.locals.flash в промежуточном ПО, вам придется выполнять перенаправление, чтобы оно отображалось. Если вы хотите отображать экстренное сообщение без перенаправления, устанавливайте значение res.locals.flash вместо req.session.flash.

### Для чего использовать сеансы

Сеансы удобны, когда вам необходимо сохранить предпочтения пользователя, относящиеся к нескольким страницам. Чаще всего сеансы используются для предоставления информации об аутентификации пользователя: вы входите в систему, и создается сеанс. После этого вам не требуется входить в систему всякий раз, когда вы перезагружаете страницу. Хотя сеансы могут быть полезны даже без учетных записей пользователя. Вполне обычно для сайтов запоминать, какая сортировка вам нравится или какой формат представления даты вы предпочитаете, — и все это без необходимости входить в систему.

## Промежуточное ПО
На понятийном уровне промежуточное ПО — способ инкапсуляции функциональности, особенно функциональности, работающей с HTTP-запросом к вашему приложению. На деле промежуточное ПО — просто функция, принимающая три аргумента: объект запроса, объект ответа и функцию next.

Промежуточное ПО выполняется способом, называемым конвейерной обработкой. Представьте себе материальную трубу, по которой течет вода. Вода закачивается через один конец трубы и проходит через манометры и клапаны, прежде чем попадает по назначению. Важный нюанс этой аналогии в том, что очередность имеет значение.

В приложениях Express вставка промежуточного ПО в программу осуществляется путем вызова app.use.

В Express 4.0 обработчики маршрутов и промежуточное ПО вызываются в том порядке, в котором они скомпонованы, что делает очередность значительно более понятной.

Общепринятой практикой является то, что последнее промежуточное ПО в вашем конвейере делается универсальным обработчиком для любого запроса, не подходящего ни для одного прочего маршрута. Такое промежуточное ПО обычно возвращает код состояния 404 («Не найдено»).

Пример универсального обработчика для любого запроса
```js
// универсальным обработчиком для любого запроса
app.use(function (req, res, next){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Не найдено!');
});
```

Обработчикам маршрутов требуется путь в качестве их первого параметра. Если вы хотите, чтобы этот путь удовлетворял любому маршруту, просто используйте /* . 
Промежуточное ПО может также принимать в качестве первого параметра
путь, но это необязательный параметр (если он опущен, это будет означать любой путь, как если бы вы указали /\*).

Обработчики маршрутов и промежуточное ПО принимают функцию обратного вызова с двумя, тремя или четырьмя параметрами.
Если параметров два или три, первые два — объекты запроса и ответа,
а третий — функция next. Если параметров четыре — промежуточное ПО становится обрабатывающим ошибки, а первый параметр — объектом ошибки, за которым следуют объекты запроса, ответа и объект next.

Если вы не вызываете next(), конвейер будет завершен и больше не будет выполняться никаких обработчиков маршрутов или промежуточного ПО. Если вы не вызываете next(), то должны отправить ответ клиенту (res.send, res.json, res.render и т. п.). Если вы этого не сделаете, клиент зависнет и в конечном счете завершится из-за превышения лимита времени.


> Connect

Установить Connect
```sh
$ npm install --save connect
```
Cделать его доступным в вашем приложении
```js
const connect = require(connect);
app.use(connect.basicAuth)();
```

> basicAuth

Обеспечивает базовую авторизацию доступа. Имейте в виду, что эта базовая аутентификация предоставляет лишь минимальную защиту, так что лучше использовать базовую аутентификацию только поверх HTTPS (в противном случае имена пользователей и пароли будут передаваться открытым текстом).
Используйте базовую аутентификацию, только когда вам требуется что-то очень быстрое и простое и вы используете HTTPS.

> body-parser

Удобное промежуточное ПО, просто компонующее json и urlencoded. Это промежуточное ПО по-прежнему включено в Connect.
Установка body-parser
```sh
$ npm install --save body-parser
```
Cделать его доступным в вашем приложении
```js
app.use(require(body-parser).urlencoded({ extended: true }));
```

> json (body-parser)

Выполняет синтаксический анализ JSON-кодированных тел запросов. Данное
промежуточное ПО понадобится вам, если вы создаете API, ожидающее на входе JSON-кодированное тело.

> urlencoded (body-parser)

Выполняет синтаксический анализ тел запросов с типом данных Интернета
application/x-www-form-urlencoded. Это наиболее распространенный способ обработки форм и запросов AJAX.

> multipart

Выполняет синтаксический анализ тел с типом данных Интернета multipart/form-data. 

> compress

Сжимает данные ответа с помощью gzip. Это отличная вещь, и ваши пользователи будут вам за нее благодарны, особенно те, у кого медленное или мобильное
подключение к Интернету.

```js
 app.use(connect.compress);
```

> cookie-parser

Обеспечивает поддержку cookie-файлов.

Установка cookie-parser
```sh
npm install --save cookie-parser
```

Сделать его доступным в вашем приложении
```js
app.use(require(cookie-parser)('здесь находится ваш секрет');
```

> cookie-session

Обеспечивает поддержку хранения сеансовой информации в cookie-файлах. 
Компоноваться это промежуточное ПО должно после cookie-parser.

Установка cookie-session
```sh
npm install --save cookie-session
```

Cделать его доступным в вашем приложении
```js
app.use(require(cookie-session)());
```

> express-session

Обеспечивает поддержку сеансов на основе идентификатора сеанса, хранимого в cookie-файле. По умолчанию используется хранилище в памяти, не подходящее для реальных условий эксплуатации, но может быть настроено для применения хранилища на основе базы данных.

Установка express-session
```sh
npm install --save cookie-session
```

Cделать его доступным в вашем приложении
```js
app.use(require(express-session)());
```

> csurf

Обеспечивает защиту от атак типа «межсайтовая подделка запроса» (cross-site request forgery, CSRF). Использует сеансы, так что должен быть скомпонован после промежуточного ПО express-session. В настоящий момент идентично промежуточному ПО connect.csrf. К сожалению, простая компоновка этого промежуточного ПО автоматически не дает защиты от CSRF-атак.

Установка csurf
```sh
npm install --save csurf
```

Cделать его доступным в вашем приложении
```js
app.use(require(csurf)());
```

> morgan

Обеспечивает поддержку автоматического журналирования: все запросы будут журналироваться.

Установка morgan
```sh
npm install --save morgan
```

Cделать его доступным в вашем приложении
```js
app.use(require(morgan)());
```

> method-override

Обеспечивает поддержку заголовка запроса x-http-method-override, позволяющего браузерам мошенничать, используя методы, отличные от GET или POST. Может быть полезно для отладки. Требуется, только если вы пишете API.

Установка method-override
```sh
npm install --save method-override
```

Cделать его доступным в вашем приложении
```js
app.use(require(method-override)());
```

> query

Выполняет синтаксический анализ строки запроса и делает ее доступной в виде свойства query объекта запроса. Это промежуточное ПО компонуется неявным образом самим Express, так что не требуется компоновать его самостоятельно.

> response-time

Добавляет в ответ заголовок X-Response-Time, содержащий время ответа в миллисекундах. Обычно это промежуточное ПО не требуется, разве что вы выполняете настройку производительности.

Установка response-time
```sh
npm install --save response-time
```

Cделать его доступным в вашем приложении
```js
app.use(require(response-time)());
```

> static

Обеспечивает поддержку выдачи статических (общедоступных файлов). Вы можете компоновать это промежуточное ПО неоднократно, указывая различные каталоги. 

Установка static
```sh
npm install --save static
```

Cделать его доступным в вашем приложении
```js
app.use(require(static)());
```

> vhost

Виртуальные хосты (vhosts) — упрощают управление поддоменами вExpress.

Установка vhost
```sh
npm install --save vhost
```

Cделать его доступным в вашем приложении
```js
const vhost = require(vhost);
```

## Отправка электронной почты

Вначале нам необходимо установить пакет Nodemailer:
```sh
npm install --save nodemailer
```
Далее загрузим пакет nodemailer и создадим экземпляр Nodemailer (транспорт, говоря языком Nodemailer):
```js
const nodemailer = require('nodemailer');
const mailTransport = nodemailer.createTransport('SMTP',{
	service: 'Gmail',
	auth: {
	user: credentials.gmail.user,
	pass: credentials.gmail.password,
 	}
});
```

Вам понадобится модифицировать файл credentials.js следующим образом:
```js
module.exports = {
	cookieSecret: 'здесь находится ваш секрет cookie-файла',
	gmail: {
		user: 'ваше имя пользователя gmail',
		password: 'ваш пароль gmail',
	}
};
```

Nodemailer предоставляет сокращенные формы записи для большинства распространенных почтовых сервисов: Gmail, Hotmail, iCloud, Yahoo! и многих других.
Если вашего MSA нет в этом списке или вам нужно соединиться непосредственно с SMTP-сервером, такая возможность тоже поддерживается:
```js
var mailTransport = nodemailer.createTransport('SMTP',{
	host: 'smtp.site.com',
	secureConnection: true, // используйте SSL
	port: 465,
	auth: {
		user: credentials.Smtp.user,
		pass: credentials.Smtp.password,
	}
});
```

### Отправка писем
Теперь, когда у нас есть экземпляр почтового транспорта, можем отправлять письма. Начнем с очень простого примера, в котором текстовое сообщение отправляется одному-единственному адресату:
```js
mailTransport.sendMail({
	from: '"ME" <info@spacex.com>',
	to: 'joe@gmail.com',
	subject: 'FYI',
	text: 'Спасибо за заказ. ' + 'Мы ждем Вас с нетерпением!',
}, function(err){
 if(err) console.error( 'Невозможно отправить письмо: ' + error );
});
```
Вы могли заметить, что здесь мы обрабатываем ошибки, но важно понимать, что отсутствие ошибок не означает успешную доставку сообщения электронной почты адресату: параметр обратного вызова error будет устанавливаться в случае проблем только при обмене сообщениями с MSA, такими как сетевая ошибка или ошибка аутентификации.


### Отправка писем нескольким адресатам

Nodemail поддерживает отправку почты нескольким адресатам путем простого отделения адресатов друг от друга запятыми:
```js
mailTransport.sendMail({
	from: '"ME" <info@spacex.com>',
	to: 'joe@gmail.com, "Джoe Клиент" <joe@yahoo.com>, ' +
	'joe@hotmail.com',
	subject: 'FYI',
	text: 'Спасибо за заказ. ' + 'Мы ждем Вас с нетерпением!',
}, function(err){
	if(err) console.error( 'Невозможно отправить письмо: ' + error );
});
```
### Массовая рассылка писем
```js
// largeRecipientList — массив адресов электронной почты
var recipientLimit = 100;
for(var i=0; i<largeRecipientList.length/recipientLimit; i++){
	mailTransport.sendMail({
		from: '"ME" <info@spacex.com>',
		to: largeRecipientList
		.slice(i*recipientLimit, i*(recipientLimit+1)).join(','),subject: 'Специальная цена на туристический пакет		"Река Худ"!',
			text: 'Закажите поездку по живописной реке Худ прямо сейчас!',
 }, function(err){
 	if(err) console.error( 'Невозможно отправить письмо: ' + error );
 });
}
```

### Добавим в приложение журналирование.

Для разработки будем использовать
Morgan (npm install --save morgan), выводящий информацию в многоцветном виде, удобном для зрительного восприятия. Для эксплуатации будем применять
express-logger 
```sh
$ npm install --save express-logger
```
поддерживающий чередование файлов журналов (каждые 24 часа файл журнала копируется и начинается заново для предотвращения чрезмерного роста размера файлов журнала). Добавим поддержку журналирования в файл приложения:

```js
switch(app.get('env')){
	case 'development':
		// сжатое многоцветное журналирование для
		// разработки
		app.use(require('morgan')('dev'));
		break;
	case 'production':
		// модуль 'express-logger' поддерживает ежедневное
		// чередование файлов журналов
		app.use(require('express-logger')({
		path: __dirname + '/log/requests.log'
		}));
	break;
}
```

Если вы хотите протестировать журналирование, можете запустить приложение в режиме эксплуатации (NODE_ENV=production node meadowlark.js). 
Если вам хочется увидеть чередование файлов журналов в действии, можете отредактировать node_modules/express-logger/logger.js, поменяв значение переменной defaultInterval на, например, 10 секунд вместо 24 часов (помните, что менять пакеты в node_modules можно только для экспериментов или обучения).

## Масштабирование проекта
Добавим поддержку кластеризации в наш сайт. Хотя обычно все это
делают в главном файле приложения, мы создадим второй файл приложения.
Он будет выполнять приложение в кластере, используя некластеризованный файл приложения, который мы все время применяли ранее. Чтобы сделать это возможным, придется сначала внести небольшие изменения в app.js:

```js
function startServer() {
	app.listen(app.get('port'), function() {
		console.log( 'Express запущен в режиме ' + app.get('env') + ' на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.' );
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
```

Когда сценарий запускается непосредственно, require.main === module будет равно true, если же это выражение равно false, значит, сценарий был загружен из другого сценария с помощью require.

Далее создаем новый сценарий app_cluster.js:
```js
const cluster = require('cluster');
function startWorker() {
    const worker = cluster.fork();
    console.log('КЛАСТЕР: Исполнитель %d запущен', worker.id);
}
if(cluster.isMaster){
    require('os').cpus().forEach(function(){
        startWorker();
    });
    // Записываем в журнал всех отключившихся
    // исполнителей;
    // Если исполнитель отключается, он должен затем
    // завершить работу, так что мы подождем
    // события завершения работы для порождения
    // нового исполнителя ему на замену
    cluster.on('disconnect', function(worker){
        console.log('КЛАСТЕР: Исполнитель %d отключился от кластера.',
            worker.id);
    });
    // Когда исполнитель завершает работу,
    // создаем исполнителя ему на замену
    cluster.on('exit', function(worker, code, signal){
        console.log('КЛАСТЕР: Исполнитель %d завершил работу' +
            ' с кодом завершения %d (%s)', worker.id, code, signal);
        startWorker();
    });
} else {
    // Запускаем наше приложение на исполнителе;
    require('./index.js')();
}
```
Теперь запустим новый кластеризованный сервер:
```sh
node app_cluster.js
```

Если хотите увидеть доказательства того, что
различные исполнители обрабатывают различные запросы, добавьте перед маршрутами следующее промежуточное ПО:

```js
app.use(function(req,res,next){
    const cluster = require('cluster');
    if(cluster.isWorker) console.log('Исполнитель %d получил запрос',
        cluster.worker.id);
});
```

### Стрессовое тестирование
Стрессовое тестирование (или нагрузочное тестирование) разработано, чтобы дать вам некоторую уверенность в том, ваш сервер будет работать под нагрузкой в сотни или тысячи одновременных запросов.

Добавим простой тест, чтобы убедиться в способности вашего приложения выдавать домашнюю страницу 50 раз в секунду. Для стрессового тестирования будем использовать модуль Node loadtest:
```sh
npm install --save loadtest
```

Теперь добавим тестовый набор qa/tests-stress.js:

```js
const loadtest = require('loadtest');
const expect = require('chai').expect;
suite('Стрессовые тесты', function(){
    test('Домашняя страница должна обрабатывать 50 ' + 'запросов в секунду', function(done){
        var options = {
            url: 'http://localhost:3000',
            concurrency: 4,
            maxRequests: 50,
        };
        loadtest.loadTest(options, function(err,result){
            expect(!err);
            expect(result.totalTimeSeconds < 1);
            done();
        });
    });
});
```

Мы уже настроили задание Mocha в Grunt, так что можем просто выполнить
команду grunt и увидеть выполнение нового теста (не забудьте сначала запустить в отдельном окне ваш сервер).
```sh
$ grunt
```

## Хранение данных

### Хранение данных в файловой системе
Один из способов хранения информации — простое сохранение данных в так называемых неструктурированных файлах (неструктурированные потому, что в таких файлах нет внутренней структуры, они представляют собой просто последовательность байтов). Node обеспечивает возможность хранения данных в файловой системе посредством модуля fs (file system — «файловая система»).

У хранения данных в файловой системе есть свои недостатки. В частности, оно плохо масштабируется: в ту же минуту, когда вам потребуется более одного сервера для обработки возросшего количества трафика, вы столкнетесь с проблемами хранения данных в файловой системе, разве что все ваши серверы имеют доступ к общей файловой системе.

В силу этих причин вам лучше использовать для хранения данных базы данных, а не файловые системы. Единственное исключение — хранение двоичных файлов, таких как изображения, звуковые или видеофайлы.

Заменим в файле приложения обработчик формы (убедитесь, что
перед этим кодом имеется var fs = require(fs)):
```js
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
```

### Хранение данных в облаке

Вот пример того, как легко можно сохранить файл в учетной записи Amazon S3:
```js
const filename = 'customerUpload.jpg';
aws.putObject({
	ACL: 'private',
	Bucket: 'uploads',
	Key: filename,
	Body: fs.readFileSync(__dirname + /tmp/ + filename)
});
```
См. документацию AWS SDK (http://aws.amazon.com/sdkfornodejs) для получения более подробной информации.

И пример того, как выполнить то же самое с помощью Microsoft Azure:
```js
const filename = 'customerUpload.jpg';
const blobService = azure.createBlobService();
blobService.putBlockBlobFromFile('uploads', filename, __dirname + '/tmp/' + filename);
 ```

См. документацию Microsoft Azure (http://bit.ly/azure_documentation) для получения более подробной информации.

### Хранение данных в базе данных
Одно из преимуществ JavaScript — исключительная гибкость его объектной
модели: если вам нужно добавить в объект свойство или метод, вы просто добавляете его, не беспокоясь о необходимости модифицировать класс. К сожалению, такая разновидность гибкости будет негативно влиять на ваши базы данных: они могут становиться фрагментированными и труднооптимизируемыми. 

Mongoose пытается найти компромисс: он представляет схемы и модели (взятые вместе, схемы и модели подобны классам в обычном объектно-ориентированном программировании). Схемы довольно гибки, но тем не менее обеспечивают необходимую для вашей базы данных структуру.

Установим модуль Mongoose:
 ```sh
npm install --save mongoose
```

добавляем учетные данные нашей базы данных в файл credentials.js:
```js
mongo: {
	development: {
		connectionString: 'your_dev_connection_string',
	},
	production: {
		connectionString: 'your_production_connection_string',
	},
}
```

Вам также понадобится пользователь для базы данных. Чтобы создать его, нажмите на Users (Пользователи), а затем на Add database user (Добавить пользователя базы данных).

Обратите внимание на то, что мы храним два набора учетных данных: один для разработки и один для эксплуатации. Можете забежать вперед и настроить две базы данных уже сейчас или просто ссылаться в обоих наборах учетных данных на одну и ту же базу данных (когда наступит время эксплуатации, вы сможете переключиться на использование двух отдельных баз данных).

### Подключение к базе данных с помощью Mongoose
Начнем с создания подключения к нашей базе данных:
```js
const mongoose = require('mongoose');
const opts = {
	server: {
		socketOptions: { keepAlive: 1 }
	}
};
switch(app.get('env')){
	 case 'development':
	 mongoose.connect(credentials.mongo.development.connectionString, opts);
	 break;
	 case 'production':
	 mongoose.connect(credentials.mongo.production.connectionString, opts);
	 break;
	 default:
	 throw new Error('Неизвестная среда выполнения: ' + app.get('env'));
}
```

Объект options необязателен, но мы хотели бы задать опцию keepAlive, которая предотвратит появление ошибок подключения к базе данных для долго работающих приложений, таких как сайт.

### Создание схем и моделей
Создадим базу. Начнем с описания схемы и создания на ее основе модели. Создайте файл models/schemas.js:
```js
const mongoose = require('mongoose');
const vacationSchema = mongoose.Schema({
	name: String,
	slug: String,
	category: String,
	sku: String,
	description: String,
	priceInCents: Number,
	tags: [String],
	inSeason: Boolean,
	available: Boolean,
	requiresWaiver: Boolean,
	maximumGuests: Number,
	notes: String,
	packagesSold: Number,
});

vacationSchema.methods.getDisplayPrice = function(){
	return '$' + (this.priceInCents / 100).toFixed(2);
};

const Vacation = mongoose.model('Vacation', vacationSchema);
module.exports = Vacation;
```

Этот код объявляет свойства, составляющие нашу модель для отпуска, и типы
этих свойств. Как видите, здесь есть несколько свойств со строковым типом данных, два численных и два булевых свойства и массив строк, обозначенный [String].
На этой стадии мы также определяем методы, работающие на нашей схеме.

Экспортируем созданный Mongoose объект модели Vacation. Чтобы использовать эту модель в приложении, можем импортировать ее следующим образом: 
```js
const Vacation = require('./models/vacation.js');
```

#### Задание начальных данных

В нашей базе данных пока еще нет никаких отпускных туров, так что мы добавим несколько для начала. Со временем вы, возможно, захотите иметь способ управлять продуктами, но для целей данной книги мы просто выполним это все в коде:
```js
Vacation.find(function(err, vacations){
	if(err) return cosole.error(err);
  		if(vacations.length) return;
 
		 new Vacation({
			 name: 'Однодневный тур по реке Худ',
			 slug: 'hood-river-day-trip',
			 category: 'Однодневный тур',
			 sku: 'HR199',
			 description: 'Проведите день в плавании по реке Колумбия ' +
			 'и насладитесь сваренным по традиционным  рецептам ' +
			 'пивом на реке Худ!',
			 priceInCents: 9995,
			 tags: ['однодневный тур', 'река худ', 'плавание', 'виндсерфинг', 'пивоварни'],
			 inSeason: true,
			 maximumGuests: 16,
			 available: true,
			 packagesSold: 0,
			 }).save();

		 new Vacation({
			 name: 'Отдых в Орегон Коуст',
			 slug: 'oregon-coast-getaway',
			 category: 'Отдых на выходных',
			 sku: 'OC39',
			 description: 'Насладитесь океанским воздухом ' +
			 'и причудливыми прибрежными городками!',
			 priceInCents: 269995,
			 tags: ['отдых на выходных', 'орегон коуст',
			 'прогулки по пляжу'],
			 inSeason: false,
			 maximumGuests: 8,
			 available: true,
			 packagesSold: 0,
			 }).save();

		 new Vacation({
			 name: 'Скалолазание в Бенде',
			 slug: 'rock-climbing-in-bend',
			 category: 'Приключение',
			 sku: 'B99',
			 description: 'Пощекочите себе нервы горным восхождением ' +
			 'на пустынной возвышенности.',
			 priceInCents: 289995,
			 tags: ['отдых на выходных', 'бенд', 'пустынная возвышенность', 'скалолазание'],
			 inSeason: true,
			 requiresWaiver: true,
			 maximumGuests: 4,
			 available: false,
			 packagesSold: 0,
			 notes: 'Гид по данному туру в настоящий момент ' +
			 'восстанавливается после лыжной травмы.',
			 }).save();
});
```

Здесь используются два метода Mongoose. Первый, find (искать), выполняет
ровно то, о чем говорит его название. В данном случае он находит все экземпляры Vacation в базе данных и выполняет обратный вызов с этим списком. Мы делаем это, потому что не хотим продолжать чтение первоначально заданных отпускных туров: если в базе данных уже есть отпускные туры, то первоначальное ее заполнение было выполнено и мы можем спокойно идти своей дорогой. 

При первом своем выполнении, однако, find вернет пустой список, так что мы переходим к созданию двух отпускных туров, а затем вызываем для них метод save, сохраняющий новые объекты в базе данных.

#### Извлечение данных
Теперь же хотим передать функции find параметр, на основе которого будет выполняться фильтрация данных, а именно отобразить только доступные в настоящий момент отпускные туры:
```html
<h1>Отпускные туры</h1>
{{#each vacations}}
 <div class="vacation">
 <h3>{{name}}</h3>
 <p>{{description}}</p>
 {{#if inSeason}}
 <span class="price">{{price}}</span>
 <a href="/cart/add?sku={{sku}}" class="btn btn-default">Buy Now!</a>
 {{else}}
 <span class="outOfSeason">К сожалению, в настоящий момент не сезон для
этого тура.
 {{! Страница "сообщите мне, когда наступит сезон для этого тура" станет
нашей следующей задачей. }}
 <a href="/notify-me-when-in-season?sku={{sku}}">Сообщите мне, когда наступит сезон для этого тура.</a>
 {{/if}}
 </div>
{{/each}}
```

Теперь мы можем создать обработчики маршрутов, которые свяжут все это
вместе:
```js
// См. маршрут для /cart/add в прилагаемом к книге репозитории
app.get('/vacations', function(req, res){
	 Vacation.find({ available: true }, function(err, vacations){
	 var context = {
	 vacations: vacations.map(function(vacation){
	 return {
	 sku: vacation.sku,
	 name: vacation.name,
	 description: vacation.description,
	 price: vacation.getDisplayPrice(),
	 inSeason: vacation.inSeason,
	 }
	 })
	 };
	 res.render('vacations', context);
	 });
});
```

В отдельных вариантах архитектуры MVC появляется третий компонент, называемый - модель представления. По сути, модель представления очищает модель (или модели) и преобразует ее наиболее подходящим для отображения в представлении образом. Фактически то, что мы выполнили ранее, было созданием модели представления на лету.

#### Добавление данных
Cоздадим схему и модель (models/vacationInSeasonListener.js):
```js
var mongoose = require('mongoose');
var vacationInSeasonListenerSchema = mongoose.Schema({
 email: String,
 skus: [String],
});
var VacationInSeasonListener = mongoose.model('VacationInSeasonListener',
 vacationInSeasonListenerSchema);
module.exports = VacationInSeasonListener;
```

Далее мы создадим представления views/notify-me-when-in-season.handlebars:
```html
<div class="formContainer">
 <form class="form-horizontal newsletterForm" role="form"
 action="/notify-me-when-in-season" method="POST">
 <input type="hidden" name="sku" value="{{sku}}">
 <div class="form-group">
 <label for="fieldEmail" class="col-sm-2 control-label">Электронная почта</label>
 <div class="col-sm-4">
 <input type="email" class="form-control" required
 id="fieldEmail" name="email">
 </div>
 </div>
 <div class="form-group">
 <div class="col-sm-offset-2 col-sm-4">
 <button type="submit" class="btn btn-default">Отправить</button>
 </div>
 </div>
 </form>
</div>
```
И наконец, обработчики маршрутов:
```js
var VacationInSeasonListener =
 require ('./models/vacationInSeasonListener.js');
app.get('/notify-me-when-in-season', function(req, res){
 res.render('notify-me-when-in-season', { sku: req.query.sku });
});
app.post('/notify-me-when-in-season', function(req, res){
 VacationInSeasonListener.update(
 { email: req.body.email },
 { $push: { skus: req.body.sku } },
 { upsert: true },
 function(err){
 if(err) {
 console.error(err.stack);
 req.session.flash = {
 type: 'danger',
 intro: 'Упс!',
 message: 'При обработке вашего запроса ' +
 'произошла ошибка.',
 };
 return res.redirect(303, '/vacations');
 }
 req.session.flash = {
 type: 'success',
 intro: 'Спасибо!',
 message: 'Вы будете оповещены, когда наступит ' +
 'сезон для этого тура.',
 };
 return res.redirect(303, '/vacations');
 }
 );
});
```

### Использование MongoDB в качестве сеансового хранилища
Хранилище в памяти не подходит для использования в среде эксплуатации. К счастью, можно легко настроить MongoDB для применения в качестве сеансового хранилища.

Чтобы обеспечить работу сеансового хранилища MongoDB, будем использовать
пакет session-mongoose. 
```sh
$npm install --save session-mongoose)
```
можно настроить его в главном файле приложения:
```js
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url:
 credentials.mongo[app.get('env')].connectionString });
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
 resave: false,
 saveUninitialized: false,
 secret: credentials.cookieSecret,
 store: sessionStore,
}));
```

Начнем с добавления списка для выбора валюты внизу страницы отпускных туров:
```html
<hr>
<p>Currency:
 <a href="/set-currency/USD" class="currency {{currencyUSD}}">USD</a> |
 <a href="/set-currency/GBP" class="currency {{currencyGBP}}">GBP</a> |
 <a href="/set-currency/BTC" class="currency {{currencyBTC}}">BTC</a>
</p>
```
Наконец, добавим обработчик маршрута для задания валюты и отредактируем
обработчик маршрута для /vacations, чтобы отображать цены в текущей валюте:
```js
app.get('/set-currency/:currency', function(req,res){
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
});
function convertFromUSD(value, currency){
    switch(currency){
    case 'USD': return value * 1;
    case 'GBP': return value * 0.6;
    case 'BTC': return value * 0.0023707918444761;
    default: return NaN;
    }
}
app.get('/vacations', function(req, res){
    Vacation.find({ available: true }, function(err, vacations){
        var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function(vacation){
            return {
            sku: vacation.sku,
            name: vacation.name,
            description: vacation.description,
            inSeason: vacation.inSeason,
            price: convertFromUSD(vacation.priceInCents/100, currency),
            qty: vacation.qty,
        }
    })
 };
switch(currency){
 case 'USD': context.currencyUSD = 'selected'; break;
 case 'GBP': context.currencyGBP = 'selected'; break;
 case 'BTC': context.currencyBTC = 'selected'; break;
}
res.render('vacations', context);
});
});
```

MongoDB — не обязательно лучший выбор сеансового хранилища: для данных целей это стрельба из пушки по воробьям. Распространенная и легкая в использовании альтернатива для сохранения сеанса — Redis.

## Маршрутизация
Маршрутизация — один из важнейших аспектов сайта или веб-сервиса; к счастью, маршрутизация вExpress отличается простотой, гибкостью и устойчивостью к ошибкам.

Маршрутизация — механизм, с помощью которого запросы (в соответствии с заданными URL и методом HTTP) находят путь к обрабатывающему их коду.

Маршрутизация обычно основывается на файлах и очень проста: если вы помещаете на ваш сайт файл foo/about.html, то сможете получить доступ к нему через браузер по адресу /foo/about.html.

### Параметры маршрутов
Параметры маршрутов это способ сделать часть вашего маршрута переменным параметром. Допустим, на сайте нам нужна отдельная страница для каждого сотрудника. У нас есть база данных сотрудников с биографиями и фотографиями. По мере роста компании добавление нового маршрута для каждого сотрудника становится все более громоздким. Посмотрим, как могут помочь в этом параметры маршрута:
```js
const staff = {
 mitch: { bio: 'Митч - человек, который прикроет вашу спину ' +
 'во время драки в баре.' },
 madeline: { bio: 'Мадлен — наш специалист по Орегону.' },
 walt: { bio: 'Уолт — наш специалист по пансионату Орегон Коуст.' },
};
app.get('/staff/:name', function(req, res){
 const info = staff[req.params.name];
 if(!info) return next(); // в конечном счете передаст
 // управление обработчику кода 404
 res.render('staffer', info);
})
```

Обратите внимание на то, как мы использовали :name в нашем маршруте.
Это будет соответствовать любой строке, не включающей в себя косую черту,
в результате чего она будет помещена в объект req.params с ключом name. Это возможность, которую мы будем часто использовать, особенно при создании интерфейса программирования приложений REST. В маршруте может быть несколько параметров. Например, если мы хотим разбить список сотрудников по городам:

```js
const staff = {
 portland: {
 mitch: { bio: 'Митч - человек, который прикроет вашу спину ' +
 'во время драки в баре.' },
 madeline: { bio: 'Мадлен — наш специалист по Орегону.' },
 },
 bend: {
 walt: { bio: 'Уолт — наш специалист по пансионату Орегон Коуст.' },
 },
};
app.get('/staff/:city/:name', function(req, res){
 const info = staff[req.params.city][req.params.name];
 if(!info) return next(); // в конечном счете передаст
 // управление обработчику кода 404
 res.render('staffer', info);
});
```

### Организация маршрутов

Вам уже, наверное, ясно, что определять все маршруты в главном файле приложения было бы слишком неуклюжим решением. Мало того, что этот файл начал бы расти с течением времени, но и просто такой способ разделения функциональности был бы отнюдь не лучшим: в нем и так уже выполняется много всего. У простого сайта может быть всего десяток или около того маршрутов, но у более крупного сайта их количество может доходить до сотен.

### Объявление маршрутов в модуле

Первый шаг организации маршрутов — размещение их в собственном модуле.
Существует несколько способов сделать это. Один из способов — создать для вашего модуля функцию, возвращающую массив объектов, содержащих свойства method и handler. Затем вы можете описать маршруты в файле своего приложения следующим образом:

```js
const routes = require('./routes.js')();
routes.forEach(function(route){
	app[route.method](route.handler);
})
```

У этого способа есть свои достоинства, и он может быть приспособлен для динамического хранения маршрутов, например, в базе данных или файле JSON.
Однако, если такая функциональность вам не нужна, советую передавать в модуль экземпляр app и поручить ему добавление маршрутов. Именно такой подход мы будем использовать в нашем примере. 

Создадим файл routes.js и переместим в него все наши существующие маршруты:

```js
module.exports = function(app){
	 app.get('/', function(req,res){
	 	app.render('home');
	 });
 	 //...ctrl+v routes
};
```

Добавим в app.js, наши маршруты:
```js
require('./routes.js')(app);
```

### Логическая группировка обработчиков

Сгруппируем нашу функциональность в следующие отдельные файлы:
handlers/main.js

В который мы поместим обработчик домашней страницы, обработчик страницы "О нас". Рассмотрим handlers/main.js:
```js
const fortune = require('../lib/fortune.js');

exports.home = function(req, res){
	res.render('home');
};

exports.about = function(req, res){
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	} );
};
//...
```

Теперь изменим routes.js, чтобы воспользоваться этим:
```js
const main = require('./handlers/main.js');

module.exports = function(app){
	app.get('/', main.home);
	app.get('/about', main.about);
	//...
};
```
Можем сгруппировать связанную функциональность в таком количестве различных файлов, какое нам нужно. и если routes.js когданибудь станет слишком громоздким, мы можем снова использовать тот же прием и передать объект app другому модулю, который, в свою очередь, зарегистрирует больше маршрутов (хотя это начинает попахивать переусложнением — убедитесь, что столь запутанный подход в вашем случае действительно обоснован).

### Автоматическая визуализация представлений
Допустим, вы просто хотите добавить файл views/foo.handlebars и каким-то
чудесным образом сделать его доступным по пути /foo. Взглянем, как это можно сделать. В файле приложения прямо перед обработчиком кода 404 добавим следующее промежуточное ПО:

```js
const autoViews = {};
const fs = require('fs');

app.use(function(req,res,next){
	const path = req.path.toLowerCase();
	// проверка кэша; если он там есть, визуализируем представление
	if(autoViews[path]) return res.render(autoViews[path]);
	// если его нет в кэше, проверяем наличие
	// подходящего файла .handlebars
	if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
		autoViews[path] = path.replace(/^\//, '');
		return res.render(autoViews[path]);
	}
	// представление не найдено; переходим к обработчику кода 404
	next();
});
```

Теперь мы можем просто добавить файл .handlebars в каталог view, и он как по мановению волшебной палочки будет визуализироваться по соответствующему пути. Обратите внимание на то, что обычные маршруты будут обходить этот механизм (поскольку мы разместили автоматический обработчик представления после всех маршрутов), так что, если у вас есть маршрут, визуализирующий другое представление для маршрута /foo, он будет иметь преимущество.

Два наиболее популярных подхода к организации маршрутов: маршрутизация
с именованной областью видимости и ресурсная маршрутизация.

Маршрутизация с именованной областью видимости хорошо зарекомендовала себя в случае наличия большого количества маршрутов, начинающихся с одного и того же префикса (например, /vacations). Применение данного подхода облегчает модуль Node express-namespace. 

Ресурсная маршрутизация автоматически добавляет маршруты на основе методов объекта. Это может быть полезной методикой, если логика сайта естественным образом является объектно-ориентированной. Пакет express-resource — пример реализации этого стиля организации маршрутов. 

Маршрутизация — важная часть вашего проекта, и если описанный в данной главе метод на основе модулей вас не устраивает, советую просмотреть документацию express-namespace или express-resource.

## API REST и JSON

Обратим внимание на то, как сделать данные и функционал доступными другим программам.

Мы попробуем добавить к приложению веб-сервис (не существует причин, по
которым веб-сервер и веб-сервис немогли бы сосуществовать в одном приложении).

«Веб-сервис» — обобщенный термин, означающий любой интерфейс программирования приложений (API), доступный по протоколу HTTP.

REST означает «передача состояния представления», а фраза «RESTful» используется в качестве прилагательного для описания веб-сервисов, которые соответствуют принципам REST. 

REST — соединение между клиентом и сервером без сохранения состояния.

###  Создаем API сервис

Мы детально спроектируем наш API, прежде чем начать его реализовывать. Нам понадобится следующая функциональность:

> GET /api/attractions

Извлекает достопримечательности. Принимает параметры строки запроса lat,
lng и radius и возвращает список достопримечательностей.

> GET /api/attraction/:id

Возвращает достопримечательность по ID.

> POST /api/attraction

Принимает lat, lng, name, description и email в теле запроса. 
Добавленная достопримечательность помещается в очередь на модерацию.

> PUT /api/attraction/:id

Обновляет существующую достопримечательность. Принимает id, lat, lng, name, description и email достопримечательности. Обновление помещается в очередь на модерацию.

> DEL /api/attraction/:id

Удаляет достопримечательность. Принимает id, email и reason достопримечательности. Удаление помещается в очередь на модерацию.

### Совместное использование ресурсов между разными источниками (CORS)
Если вы публикуете API, то, вероятно, хотели бы сделать его доступным для других. Это приведет к появлению межсайтовых HTTP-запросов. 

Межсайтовые HTTP-запросы использовались во многих атаках, из-за чего их применение было ограничено в соответствии с принципом одинакового источника, накладывающим ограничения на места, откуда могут быть загружены сценарии. А именно, должны совпадать протокол, домен и порт.

CORS позволяет вам в отдельных случаях убирать эти ограничения вплоть до указания списка конкретных доменов, которым разрешен доступ к сценарию. CORS реализуется посредством заголовка Access-Control-Allow-Origin. 

Простейший способ реализовать его в приложении Express состоит в использовании пакета cors:
```sh
$ npm install --save cors
```

Чтобы активизировать CORS в вашем приложении, напишите:
```js
app.use(require('cors')());
```

Мы хотим сделать доступным весь наш API (но только API), так что ограничим CORS путями, начинающимися с /api:
```js
app.use('/api', require('cors')());
```

### Хранилище данных API

Мы снова используем Mongoose, чтобы создать схему для модели достопримечательностей в базе данных. Создадим файл models/attraction.js:

```js
const mongoose = require('mongoose');
const attractionSchema = mongoose.Schema({
	name: String,
	description: String,
	location: { lat: Number, lng: Number },
	history: {
		event: String,
		notes: String,
		email: String,
		date: Date,
	},
	updateId: String,
	approved: Boolean,
});
const Attraction = mongoose.model('Attraction', attractionSchema);
module.exports = Attraction;
```

Поскольку мы хотим модерировать обновления, то не можем позволить API просто обновлять исходную запись. Подход будет состоять в создании новой записи, ссылающейся на исходную (в ее свойстве updateId). Как только запись будет одобрена, мы можем обновить исходную запись информацией из записи с обновлением, а затем удалить запись с обновлением.


### Использование Express для предоставления API
```js
const Attraction = require('./models/attraction.js');

app.get('/api/attractions', function(req, res){
    Attraction.find({ approved: true }, function(err, attractions){
        if(err) return res.status(500).send('Произошла ошибка: ошибка базы данных.');
        res.json(attractions.map(function(a){
            return {
                name: a.name,
                id: a._id,
                description: a.description,
                location: a.location,
            }
        }));
    });
});
app.post('/api/attraction', function(req, res){
    const a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    a.save(function(err, a){
        if(err) return res.status(500).send(' Произошла ошибка: ошибка базы данных.');
        res.json({ id: a._id });
    });
});

app.get('/api/attraction/:id', function(req,res){
    Attraction.findById(req.params.id, function(err, a){
        if(err) return res.status(500).send(' Произошла ошибка: ошибка базы данных.');
        res.json({
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location,
        });
    });
});
```

### Подготовка Unit тестов для API
Прежде чем мы будем писать тесты для API, нам потребуется способ вызова API REST. Для этого будем применять пакет Node, который называется restler:
```sh
$ npm install --save-dev restler
```

Поместим тесты для тех вызовов API, которые мы собираемся реализовать,
в файл qa/tests-api.js:
```js
const assert = require('chai').assert;
const http = require('http');
const rest = require('restler');
suite('API tests', function(){
     const attraction = {
         lat: 45.516011,
         lng: -122.682062,
         name: 'Художественный музей Портленда',
         description: 'Не упустите возможность посмотреть созданную ' +
         ' в 1892 году коллекцию произведений местного искусства ' +
         ' художественного музея Портленда. Если же вам больше ' +
         ' по душе современное искусство, к вашим услугам шесть ' +
         ' этажей, посвященных современному искусству.',
         email: 'test@meadowlarktravel.com',
     };
     const base = 'http://localhost:3000';
     
    test('проверка возможности добавления достопримечательности',
     function(done){
         rest.post(base+'/api/attraction', {data:attraction}).on('success',
         function(data){
             assert.match(data.id, /\w/, 'должен быть задан id');
             done();
         });
     });
     test('проверка возможности извлечения достопримечательности',
     function(done){
         rest.post(base+'/api/attraction', {data:attraction}).on('success',
         function(data){
             rest.get(base+'/api/attraction/'+data.id).on('success',
             function(data){
                 assert(data.name===attraction.name);
                 assert(data.description===attraction.description);
                 done();
             })
         })
     });
});
```

Любой тест должен быть автономным и не зависеть ни от какого другого теста.

Теперь, если мы запустим тесты на выполнение (или с помощью Grunt, или
посредством:
```sh
$ mocha -u tdd -R spec qa/tests-api.js
```
то увидим, что они выполняются успешно.

### Использование плагина REST

Как вы могли видеть, можно легко написать API с помощью одного только Express.
Однако в использовании плагина REST есть свои преимущества. Применим надежный, устойчивый к ошибкам connect-rest, чтобы наш API смог выдержать
испытание временем. Для начала установим его:
```sh
$ npm install --save connect-rest
```

импортируем в app.js:
```js
const rest = require('connect-rest');
```

Наш API не должен конфликтовать с обычными маршрутами сайта (убедитесь,
что не создаете никаких маршрутов сайта, начинающихся с /api). Я рекомендую добавлять маршруты API после маршрутов сайта: модуль connect-rest будет просматривать каждый запрос и добавлять свойства в объект запроса, а также выполнять дополнительное журналирование. По этой причине его лучше вставлять после компоновки маршрутов вашего сайта, но перед обработчиком кода 404:

```js
// Здесь находятся маршруты сайта
// Описывайте маршруты API здесь с помощью rest.VERB...
// Конфигурация API
var apiOptions = {
 context: '/api',
 domain: require('domain').create(),
};
// Компоновка API в конвейер
app.use(rest.rester(apiOptions));
// Здесь находится обработчик кода 404

```

> Если вы стремитесь максимально разделить ваши сайт и API, рассмотрите возможность использования поддомена, например, api.meadowlark.com. 

А пока что connect-rest уже принес нам некоторую пользу: позволил автоматически добавить ко всем вызовам API префикс /api. Это снижает вероятность опечаток и дает нам возможность при желании легко поменять базовый URL.

Теперь взглянем, как добавляются методы API:
```js
rest.get('/attractions', function(req, content, cb){
    Attraction.find({ approved: true }, function(err, attractions){
        if(err) return cb({ error: 'Внутренняя ошибка.' });
        cb(null, attractions.map(function(a){
            return {
                name: a.name,
                description: a.description,
                location: a.location,
            };
        }));
    });
});
rest.post('/attraction', function(req, content, cb){
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    a.save(function(err, a){
        if(err) return cb({ error: 'Невозможно добавить ' +
                'достопримечательность.' });
        cb(null, { id: a._id });
    });
});

rest.get('/attraction/:id', function(req, content, cb){
    Attraction.findById(req.params.id, function(err, a){
        if(err) return cb({ error: 'Невозможно извлечь ' +
                'достопримечательность.' });
        cb(null, {
            name: attraction.name,
            description: attraction.description,
            location: attraction.location,
        });
    });
});
```

Функции REST принимают вместо обычной пары «запрос/ответ» до трех
входных параметров: запрос (обычный), объект контента, представляющий собой синтаксически разобранное тело запроса, и функцию обратного вызова, которую можно использовать для асинхронных вызовов API. Поскольку мы применяем базу данных, по своей сущности асинхронную, необходимо использовать обратный вызов для отправки ответа клиенту, существует и синхронное API, о котором вы можете прочитать в документации connect-rest (https://github.com/imrefazekas/connect-rest).

### Использование поддомена

Поскольку API существенным образом отличается от сайта, распространенным
решением является применение поддомена для отделения API от остальной части сайта. Сделать это несложно, так что переделаем наш пример для использования api.site.com вместо site.com/api.

Вначале убедимся, что установлено промежуточное ПО vhost:
```sh
$ npm install --save vhost
```
Вероятно, в вашей среде разработки не установлен собственный сервер DNS, так что нам понадобится способ заставить Express думать, что
вы подключаетесь к поддомену. Чтобы добиться этого, добавим строку в файл hosts следующую строку:
127.0.0.1 api.meadowlark

Теперь просто компонуем новый vhost для создания поддомена:
```js
app.use(vhost('api.*', rest.rester(apiOptions));
```

Вам также понадобится переключить контекст:
```js
const apiOptions = {
 context: '/',
 domain: require('domain').create(),
};
```

Вот, собственно, и все. Все маршруты API, которые вы описали через вызовы
rest.VERB, теперь будут доступны в поддомене api. 

## Реализация MVC в Express
Одной из наиболее популярных парадигм в разработке, ставшей известной в последние годы, является шаблон проектирования MVC (Model — View — Controller, «модель — представление — контроллер»).

Одним из крупнейших преимуществ MVC, является уменьшение порога вхождения в проект. Например, PHP-разработчик, знакомый со структурой MVC, может разобраться в .NET MVC-проекте с удивительной легкостью, так как вы знаете, где найти то, что вам нужно.

MVC разделяет функциональность на очень хорошо определенные сферы, обеспечивая общую структуру для разработки программного обеспечения.

В MVC модель — это чистое представление ваших данных и логики. Она сама
по себе совершенно не связана со взаимодействием с пользователем. Представление передает модель пользователю, а контроллер принимает пользовательский ввод, обрабатывает модели и выбирает, какое представление нужно отображать. 

### Модели
Если ваша модель прочная и хорошо спроектирована, вы всегда можете выбросить за ненадобностью уровень представления данных. Модели —это фундамент вашего проекта.

Жизненно важно, чтобы вы не загрязняли свои модели любыми презентациями
или кодом взаимодействия с пользователями. Я могу вас заверить: даже если это выглядит просто или целесообразно, таким образом вы лишь создаете проблемы для самих себя в будущем. А более сложная и спорная проблема — это отношения между вашими моделями и уровнем хранения данных.

Я рекомендую создать в проекте подкаталоги, названные models, чтобы вы могли хранить свои модели там. Всякий раз, когда у вас появляются логика для внедрения или данные для хранения, вы должны делать это в файле в пределах каталога models. Например, мы могли бы хранить данные пользователей и логику в файле, названном /models/customer.js:

```js
const mongoose = require('mongoose');
const Order = require('./order.js');

const customerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    salesNotes: [{
        date: Date,
        salespersonId: Number,
        notes: String,
    }],
});

customerSchema.methods.getOrders = function(cb){
    return Order.find({ customerId: this._id }, cb);
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
```

### Модели представления
я настоятельно рекомендую создавать модель представления, если вы решаете модифицировать модель, просто потому, что вам нужно отобразить что-то в представлении.

Модели представления дают вам возможность сохранять модель обобщенной и в то же время предоставляющей осмысленные данные к представлению.

У нас есть модель, названная Customer. Сейчас мы хотим создать представление, показывающее данные покупателя вместе со списком заказов. Модель Customer, однако, работает не вполне правильно. Есть данные, которые мы не хотим показывать покупателю (заметки о покупке), поэтому можем захотеть форматировать имеющиеся там данные другим способом (например, корректно форматировать адрес электронной почты и номер телефона). Более того, мы хотим отображать данные, которых даже нет вмодели Customer, такие как список заказов покупателя. Вот тогда модели представления и пригодятся. Создадим модель представления в viewModels/customer.js:

```js
// удобная функция для присоединения полей
function smartJoin(arr, separator){
    if(!separator) separator = ' ';
    return arr.filter(function(elt){
        return elt!==undefined &&
            elt!==null &&
            elt.toString().trim() !== '';
    }).join(separator);
}
module.exports = function(customer, orders){
    return {
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: smartJoin([customer.firstName, customer.lastName]),
        email: customer.email,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        fullAddress: smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        phone: customer.phone,
        orders: orders.map(function(order){
            return {
                orderNumber: order.orderNumber,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.orderNumber,
            }
        }),
    }
}
```

Концепция моделей представления обязательна для защиты целостности
и области действия модели. Если вы находите все, что скопировали (например, firstname: customer.firstName), то можете захотеть посмотреть в Underscore, что дает вам возможность более тщательно составлять объекты.

Например, вы можете клонировать объект, выбирая только желаемые свойства, или пойти обходным путем и клонировать объект, пропуская только определенные свойства. Вот предыдущий пример, переписанный в с помощью Underscore.

Установите Underscore:
```sh
$ npm install --save underscore
```

```js
var _ = require('underscore');
// получаем модель представления покупателя
function getCustomerViewModel(customer, orders){
    var vm = _.omit(customer, 'salesNotes');
    return _.extend(vm, {
        name: smartJoin([vm.firstName, vm.lastName]),
        fullAddress: smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        orders: orders.map(function(order){
            return {
                orderNumber: order.orderNumber,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.orderNumber,
            };
        }),
    });
}
```

Обратите внимание на то, что мы также используем метод JavaScript .map для установки списка заказов для модели представления покупателя. В сущности, мы создаем на лету (или анонимно) модель представления. Альтернативным подходом было бы создание объекта «модель представления заказа покупателя».

Это было бы лучшим подходом, если бы мы использовали эту модель представления во многих местах.

### Контроллеры

Контроллер отвечает за обработку пользовательского взаимодействия и выбор
соответствующих представлений к отображению, базирующийся на этом пользовательском взаимодействии. Звучит очень похоже на маршрутизацию запросов, не правда ли? В действительности единственной разницей между контроллером и маршрутизатором является то, что контроллеры обычно группируют соответствующую функциональность.

Представим контроллер покупателя, он был бы ответственен за отображение
и редактирование пользовательской информации, включая сделанные покупателем заказы. Создадим такой контроллер controllers/customer.js:

```js
var Customer = require('../models/customer.js');
var customerViewModel = require('../viewModels/customer.js');
exports = {
    registerRoutes: function(app) {
        app.get('/customer/:id', this.home);
        app.get('/customer/:id/preferences', this.preferences);
        app.get('/orders/:id', this.orders);
        app.post('/customer/:id/update', this.ajaxUpdate);
    },
    home: function(req, res, next) {
        Customer.findById(req.params.id, function(err, customer) {
            if(err) return next(err);
            if(!customer) return next(); // передать это обработчику 404
            customer.getOrders(function(err, orders) {
                if(err) return next(err);
                res.render('customer/home',
                    customerViewModel(customer, orders));
            });
        });
    },
    preferences: function(req, res, next) {
        Customer.findById(req.params.id, function(err, customer) {
            if(err) return next(err);
            if(!customer) return next(); // передать это обработчику 404
            customer.getOrders(function(err, orders) {
                if(err) return next(err);
                res.render('customer/preferences',
                    customerViewModel(customer, orders));
            });
        });
    },
    orders: function(req, res, next) {
        Customer.findById(req.params.id, function(err, customer) {
            if(err) return next(err);
            if(!customer) return next(); // передать это обработчику 404
            customer.getOrders(function(err, orders) {
                if(err) return next(err);
                res.render('customer/preferences',
                    customerViewModel(customer, orders));
            });
        });
    },
    ajaxUpdate: function(req, res) {
        Customer.findById(req.params.id, function(err, customer) {
            if(err) return next(err);
            if(!customer) return next(); // передать это обработчику 404
            if(req.body.firstName){
                if(typeof req.body.firstName !== 'string' ||
                    req.body.firstName.trim() === '')
                    return res.json({ error: 'Invalid name.'});
                customer.firstName = req.body.firstName;
            }
            // и т. д.
            customer.save(function(err) {
                return err ? res.json({ error: 'Ошибка обновления покупателя.' })
                    :
                    res.json({ success: true });
            });
        });
    },
};
```

Если вы хотите полностью отделить контроллеры от маршрутизации, то наверняка можете сделать это. По-моему, это была абстракция, в которой нет необходимости, однако она могла бы иметь смысл, если бы вы хотели написать контроллер, который управлял бы также разными видами пользовательского интерфейса (как родное приложение, например).

## Безопасность 

### HTTPS
Первый шаг к предоставлению безопасных сервисов — это использование безопасного HTTP (HTTPS). Природа Интернета делает возможным перехват пакетов, передающихся между клиентами и серверами. HTTPS шифрует эти пакеты, делая получение доступа к передаваемой информации для атакующего экстремально сложной задачей.

Протокол HTTPS базируется на сервере, у которого есть сертификат открытого ключа (Public key certificate), иногда называемый сертификатом SSL.

Идея сертификатов состоит в том, что есть центры сертификации (Certification authorities, CA), которые выпускают сертификаты. Центр сертификации создает корневые сертификаты (Trusted root certificates), доступные производителям браузеров. Браузеры включают эти корневые сертификаты, когда вы устанавливаете браузер, и это устанавливает цепочку сертификатов между центром сертификации и браузером.

Для того чтобы эта цепочка работала, ваш сервер должен использовать сертификат, выпущенный центром сертификации.

#### Создание собственного сертификата
Создать собственный сертификат просто, но подходит это только для целей разработки и тестирования. Так как браузеры будут доверять только
сертификатам, изданным известными центрами сертификации.

Для создания собственного сертификата вам понадобится реализация OpenSSL.

```sh
$ sudo apt-get install openssl
```

После того как установите OpenSSL, можете создать приватный ключ и публичный сертификат:
```sh
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 —keyout myKey.pem -out myKey.crt
```
Файл PEM — это ваш приватный ключ, и он не должен быть доступен клиентской стороне. Файл CRT — это самоподписанный сертификат, который будет передаваться браузеру для установки защищенного соединения.

В качестве альтернативы можете получить бесплатные самоподписанные сертификаты на таких сайтах, как http://www.selfsignedcertificate.com.

### Разрешение HTTPS для вашего приложения в Express

Когда у вас есть ваш приватный ключ и сертификат, использовать его в вашем приложении довольно просто. Вернемся к тому, как мы создавали сервер:
```js
app.listen(app.get('port'), function() {
    console.log('Express started in ' + app.get('env') +
        ' mode on port ' + app.get('port') + '.');
});
```

Переключение на HTTPS довольно простое. Я рекомендую разместить ваш
приватный ключ и сертификат SSL в подкаталоге, называемом ssl (хотя довольно часто их хранят в корневом каталоге проекта). Затем просто используйте модуль https вместо http и передайте объект Options методу createServer:

```js
const https = require('https'); // обычно в начале файла

const options = {
    key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
};

https.createServer(options, app).listen(app.get('port'), function(){
    console.log('Express started in ' + app.get('env') +
        ' mode on port ' + app.get('port') + ' using HTTPS.');
});
```

В Nginix есть отдельный блок конфигурации для HTTP и HTTPS. Если вы не установите X-Forwarded-Protocol в блоке конфигурации, соответствующем HTTP, вы открываетесь для возможности подмены заголовка клиентом и, таким образом, обмана вашего приложения, которое будет считать соединение безопасным, даже если на самом деле это не так. Если вы используете этот подход, обязательно убедитесь в том, что всегда устанавливаете заголовок X-Forwarded-Protocol.

Express обеспечивает некоторые удобные свойства, которые меняют поведение (довольно корректно), когда вы используете прокси. Не забудьте указать Express доверять прокси посредством app.enable('trust proxy'). Когда вы это сделаете, req.protocol, req.secure и req.ip будут относиться к соединению клиента к прокси, а не к вашему приложению.

### Межсайтовая подделка запроса
Атаки межсайтовой подделки запроса (Cross-Site Request Forgery, CSRF) пользуются тем, что пользователи обычно доверяют своему браузеру и посещают множество сайтов в течение одной и той же сессии. В ходе атаки скрипт CSRF на сайте злоумышленника делает запросы другому сайту: если вы залогинены на другом сайте, сайт злоумышленника может успешно получить доступ к безопасным данным с другого сайта.

Для предотвращения атак CSRF у вас должен быть способ убедиться в том, что запрос законно пришел от вашего сайта. Способ, спомощью которого мы это делаем, — это передача уникального токена браузера. Когда браузер отправляет форму, сервер проверяет токены, чтобы убедиться, что они совпадают. Промежуточное ПО csurf само обрабатывает создание и проверку токена, все, что вы должны сделать, — убедиться в том, что токен включен в запросы серверу. 

Установите промежуточное ПО csurf
```sh
$ npm install --save csurf
```
затем скомпонуйте его и добавьте токен к res.locals:
```js
// это должно быть вставлено после анализатора тела запроса,
// анализатора cookie и express-сессии
app.use(require('csurf')());
app.use(function(req, res, next){
	res.locals._csrfToken = req.csrfToken();
	next();
});
```

Промежуточное ПО csurf добавляет метод csurfToken кобъекту запроса. Нам не нужно назначать его к res.locals — мы могли бы просто вызвать req.csurfToken() явно в каждом представлении, в котором это требуется, но данное решение требует меньших трудозатрат.

Сейчас на всех ваших формах нужно предоставить поле
с именем "_ csrf", которое должно совпадать со сгенерированным токеном. Посмотрим, как бы мы добавили это к одной из наших форм:

```html
<form action="/newsletter" method="POST">
	<input type="hidden" name="_csrf" value="{{_csrfToken}}">
	Name: <input type="text" name="name"><br>
	Email: <input type="email" name="email"><br>
 <button type="submit">Отправить</button>
</form>
```

Промежуточное ПО csurf будет обрабатывать все остальное: если поле содержит поля, но нет действительного поля csrf, оно вызовет ошибку (убедитесь, что у вас есть маршрутизация ошибок в промежуточном ПО!). Теперь удалите скрытое поле и посмотрите, что получится.

Если у вас есть API, вы наверняка не захотите, чтобы промежуточное ПО csurf с ним взаимодействовало. Если хотите ограничить доступ к вашему API с остальных сайтов, нужно посмотреть функциональность API key в connect-rest. Для предотвращения взаимодействия csurf с промежуточным ПО подключите его перед тем, как подключите csurf.

## Аутентификация и авторизация 

Аутентификация относится к проверке подлинности пользователя, то есть того, что он тот, за кого себя выдает. 

Авторизация относится к определению того, к чему пользователь может получить доступ в целом.

Обычно (но не всегда) вначале выполняется аутентификация, а затем устанавливается авторизация. Авторизация может быть очень простой (авторизирован/ не авторизирован), широкой (пользователь/администратор) или очень гибкой, определяющей привилегии чтения, записи, удаления и обновления в зависимости от разных типов учетных записей. Сложность вашей системы авторизации зависит от типа приложения, которое вы пишете.

### Хранение пользователей в вашей базе данных
Вне зависимости от того, полагаетесь вы на сторонний сервис для аутентификации ваших пользователей или нет, вы захотите хранить записи пользователей в своей базе данных.

создадим для наших пользователей модель models/user.js:
```js
var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
 authId: String,
 name: String,
 email: String,
 role: String,
 created: Date,
});
var User = mongoose.model('User', userSchema);
module.exports = User;
```

У каждого объекта вMongoDB есть уникальный идентификатор, записанный в его свойстве _ id. Однако этот идентификатор контролируется MongoDB, и нам нужен какой-то способ установить соответствие записи пользователя и стороннего идентификатора, так что у нас есть свойство идентификатора,
названное authId. Поскольку мы будем использовать несколько стратегий аутентификации, для предотвращения коллизий название этого идентификатора будет комбинацией имени стратегии и стороннего идентификатора. 

Например, у пользователя Facebook это может быть authId facebook:525764102, тогда как у пользователя Twitter — authId twitter:376841763.

### Аутентификация или регистрация и пользовательский опыт
Аутентификация относится к проверке личности пользователя посредством либо доверенного стороннего сервиса, либо учетных данных, предоставляемых пользователю (таких как имя пользователя и пароль).

Регистрация — это процесс, в результате которого пользователь получает учетную запись на вашем сайте (с нашей точки зрения, регистрация — это создание для этого пользователя записи в базе данных).

### Passport
Passport — это очень популярный и надежный модуль аутентификации для Node/ Express. Он не связан с каким-либо механизмом аутентификации, скорее, основан на подключаемых стратегиях аутентификации (включая локальную стратегию, если вы не хотите использовать стороннюю аутентификацию).

Важно понять одну деталь: со сторонней аутентификацией ваше приложение
никогда не получает пароль. Это обрабатывается полностью сторонним сервисом.

Это хорошо, поскольку бремя обеспечения безопасности и хранения паролей передается этому стороннему сервису.

Пароль может быть проверен посредством хранения того, что называется хешем (hash) с солью (salt), то есть трансформированного в одну сторону пароля. Таким образом, когда вы генерируете хеш из пароля, то не можете восстановить пароль. Salt + hash обеспечивает дополнительную защиту от определенных видов атак.

Когда вы используете Passport, то проходите четыре шага, за которые ваше приложение будет ответственно.

> Браузер может выполнять три вещи: делать HTTP-запрос, отображать ответ и осуществлять перенаправление, в котором, в свою очередь, может быть другое перенаправление.

1. Страница входа в систему. Страница входа — то место, где пользователь может выбрать метод логина. Если вы используете стороннюю аутентификацию, обычно это просто кнопка или ссылка. Если вы применяете локальную аутентификацию, то будут видны поля имени пользователя и пароля. 

Если пользователь попытается получить доступ к URL, требующему аутентификации (такому как /account в нашем примере), не будучи залогиненным, то, возможно, это будет та страница, на которую вы захотите перенаправлять (альтернативный путь — можете перенаправлять на страницу Не авторизирован со ссылкой на страницу входа в систему).

2. Создать запрос аутентификации. На этом шаге вы создаете запрос, который будет отправлен стороннему сервису через перенаправление. Детали этого запроса сложны и зависят от стратегии аутентификации. Здесь всю тяжелую работу будут выполнять Passport и плагин стратегии. Запрос аутентификации включает защиту от атаки посредника, равно как и от других путей, которыми может пойти злоумышленник. 

Обычно запрос аутентификации непродолжительный, так что вы не можете его сохранить и ожидать, что будете использовать его впоследствии: это помогает предотвратить атаки, ограничивая время, в течение которого злоумышленник может атаковать. В этом месте вы также можете запрашивать дополнительную информацию от механизма сторонней авторизации.

Например, довольно часто запрашивается имя пользователя и, возможно, адрес электронной почты. Учтите, что чем больше информации вы запрашиваете у пользователя, тем меньше вероятность авторизации им вашего приложения.

3. Проверить ответ аутентификации. Предположим, пользователь авторизовал
ваше приложение и вы возвращаетесь назад с подтвержденным ответом аутентификации от стороннего сервиса, что подтверждает личность вашего пользователя. Еще раз: детали этой проверки сложны и будут обрабатываться Passport и плагином стратегии. Если ответ аутентификации указывает, что пользователь не авторизирован (если были введены неправильные учетные данные или ваше приложение не было авторизовано пользователем), вам следует выполнить перенаправление на соответствующую страницу (либо обратно на страницу логина, либо на страницу Не авторизирован или Не удалось авторизировать).

В ответ аутентификации будут включены идентификатор для пользователя,
уникальный для конкретного стороннего сервиса, любые другие данные, которые вы запрашивали на шаге 2. Для разрешения шага 4 мы должны «запомнить», что пользователь авторизирован. Обычный способ это сделать — установить переменную сессии, включающую идентификатор пользователя, указывающую, таким образом, что эта сессия уже авторизирована (можно использовать и cookie, хотя я рекомендую применять сессии).

4. Проверить авторизацию. На шаге 3 мы записали идентификатор пользователя в этой сессии. Наличие этого идентификатора позволяет нам получить объект пользователя из базы данных, содержащий информацию о том, какие функции этот пользователь авторизован выполнять. Таким образом, нет необходимости выполнять стороннюю аутентификацию для каждого запроса. Эта задача проста, и для ее решения нам больше не нужен Passport — у нас есть собственный объект пользователя, содержащий наши собственные правила аутентификации.

Если этот объект недоступен, значит, запрос не авторизован и мы можем перенаправлять на страницу логина или на страницу Не авторизирован.

#### Установка Passport
Установим Passport и стратегию аутентификации Facebook:
```sh
npm install --save passport passport-facebook
```

Cоздадим модуль, называемый lib/auth.js.

```js
var User = require('../models/user.js'),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy;
	// GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done){
	done(null, user._id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		if(err || !user) return done(err, null);
		done(null, user);
	});
});
```

Passport использует serializeUser и deserializeUser для установки соответствия
запросов аутентификации пользователя, позволяя вам применять любой желаемый
метод хранения. В данном случае мы собираемся сохранять идентификатор, присвоенный MongoDB (свойство id экземпляров модели User) в этой сессии. Используемый нами способ осуществляет сериализацию и десериализацию немного неправильно: мы на самом деле просто храним идентификатор пользователя в сессии.

Затем при необходимости можем получить экземпляр модели User с помощью
поиска этого идентификатора в базе данных.

После того как эти два метода будут реализованы, пока сессия активна и пользователь успешно прошел аутентификацию, req.session.passport.user будет соответствовать экземпляру модели User.

Далее мы собираемся выбрать, что экспортировать. Для включения функциональности Passport нужно сделать два отдельных мероприятия: инициализировать Passport и зарегистрировать маршруты, которые будут обрабатывать аутентификацию и перенаправленные обратные вызовы от наших сервисов сторонней аутентификации. Мы не хотим объединять их в одной функции, поскольку в главном файле приложения можем захотеть выбрать вариант, когда Passport связан в цепочку промежуточного ПО.

Мы должны связать промежуточное ПО Passport с нашим приложением, функция будет простым способом передать объект в приложение Express:
```js

module.exports = function(app, options){

	// if success and failure redirects aren't specified,
	// set some reasonable defaults
	if(!options.successRedirect)
		options.successRedirect = '/account';
	if(!options.failureRedirect)
		options.failureRedirect = '/login';

	return {

		init: function() {
			var env = app.get('env');
			var config = options.providers;

			// configure Facebook strategy
			passport.use(new FacebookStrategy({
				clientID: config.facebook[env].appId,
				clientSecret: config.facebook[env].appSecret,
				callbackURL: (options.baseUrl || '') + '/auth/facebook/callback',
			}, function(accessToken, refreshToken, profile, done){
				var authId = 'facebook:' + profile.id;
				User.findOne({ authId: authId }, function(err, user){
					if(err) return done(err, null);
					if(user) return done(null, user);
					user = new User({
						authId: authId,
						name: profile.displayName,
						created: Date.now(),
						role: 'customer',
					});
					user.save(function(err){
						if(err) return done(err, null);
						done(null, user);
					});
				});
			}));

			app.use(passport.initialize());
			app.use(passport.session());
		},

		registerRoutes: function(){
			// register Facebook routes
			app.get('/auth/facebook', function(req, res, next){
				if(req.query.redirect) req.session.authRedirect = req.query.redirect;
				passport.authenticate('facebook')(req, res, next);
			});
			app.get('/auth/facebook/callback', passport.authenticate('facebook', 
				{ failureRedirect: options.failureRedirect }),
				function(req, res){
					// we only get here on successful authentication
					var redirect = req.session.authRedirect;
					if(redirect) delete req.session.authRedirect;
					res.redirect(303, redirect || options.successRedirect);
				}
			);
		},
	};
};
```

Нам понадобится добавить свойство authProviders в credentials.js:
```js
module.exports = {
	authProviders: {
		facebook: {
			development: {
				appId: 'your_app_id',
				appSecret: 'your_app_secret',
			},
		},
	},
}
```

Теперь у нас есть путь /auth/facebook; посещение этого пути автоматически перенаправит посетителя на страницу аутентификации Facebook.

Обратитe внимание на то, что мы проверяем, есть ли параметр строки запросов redirect. Если он есть, сохраняем его в сессии. Так мы можем автоматически перенаправлять пользователя к месту назначения после завершения аутентификации.

Магия Passport во время этого процесса — сохранение пользователя (в нашем случае просто идентификатора пользователя в базе данных MongoDB) в сессию.
Это хорошо, поскольку браузер выполняет перенаправление, что является другим запросом HTTP: не получая этой информации в сессии, мы не имели бы какого-то способа узнать, что пользователь был аутентифицирован! 

Как только аутентификация пользователя пройдет успешно, будет установлен req.session.passport.user, и таким образом будущие запросы будут знать, что этот пользователь прошел аутентификацию.

Посмотрим на обработчик /account и увидим, как он проверяет, что пользователь прошел аутентификацию (этот обработчик маршрута будет в главном файле приложения или в отдельном модуле маршрутизации, не в /lib/auth.js):

```js
app.get('/account', function(req, res) {
	if(!req.user)
	return res.redirect(303, '/unauthorized');
	res.render('account', { username: req.user.name });
});
// нам также нужна страница 'Не авторизирован'
app.get('/unauthorized', function(req, res) {
	res.status(403).render('unauthorized');
});

Сейчас только прошедшие аутентификацию пользователи увидят страницу учетной записи; все остальные будут перенаправлены на страницу Не авторизирован.

### Авторизация на основе ролей

Допустим, мы хотим, чтобы покупатели видели только свои учетные записи (сотрудники могут видеть гораздо больше, когда получат доступ к информации учетной записи пользователя).

Помните, что в одном маршруте у вас может быть несколько функций, которые вызываются в определенном порядке. Создадим функцию customersOnly, которая пропустит только покупателей:

```js
function customerOnly(req, res, next){
 if(req.user && req.user.role==='customer') return next();
 // Мы хотим, чтобы при посещении страниц только
 // покупатели знали, что требуется логин
 res.redirect(303, '/unauthorized');
}
```

Создадим также функцию employeeOnly, которая будет работать немного подругому. Скажем, у нас есть путь /sales, который мы хотим сделать доступным только для сотрудников. Кроме того, мы не хотим, чтобы все прочие знали о его существовании, даже если наткнутся на него случайно. 

Если потенциальный злоумышленник пойдет на путь /sales, он увидит страницу Не авторизирован, а это уже небольшая информация, которая сделает атаку проще (просто из-за того что известно, что такая страница существует).

Таким образом, для обеспечения небольшой дополнительной безопасности мы хотим, чтобы не сотрудники, посещая страницу /sales, видели обычную страницу 404, которая не позволит потенциальным злоумышленникам работать с ней:
```js
function employeeOnly(req, res, next){
	if(req.user && req.user.role==='employee') return next();
	// мы хотим, чтобы неуспех авторизации посещения
	// страниц только для сотрудников был скрытым
	// чтобы потенциальные хакеры не смогли даже
	// узнать, что такая страница существует
	next('route');
}
```

Вызов next('route') не просто выполнит следующий обработчик в маршруте —
он пропустит этот маршрут в целом. Если предположить, что нет дальнейшего маршрута, который будет обрабатывать /account, это в конечном итоге приведет к обработчику 404, давая нам желаемый результат.

```js
Вот как просто использовать эти функции:
// маршруты покупателя
app.get('/account', customerOnly, function(req, res){
	res.render('account');
});
app.get('/account/order-history', customerOnly, function(req, res){
	res.render('account/order-history');
});
app.get('/account/email-prefs', customerOnly, function(req, res){
	res.render('account/email-prefs');
});
// маршруты сотрудника
app.get('/sales', employeeOnly, function(req, res){
	res.render('sales');
});
```

Например, что если вы хотите разрешить несколько ролей? Можете использовать следующую функцию и маршрут:
```js
function allow(roles) {
	return function(req, res, next) {
	if(req.user && roles.split(',').indexOf(req.user.role)!==-1) return next();
	res.redirect(303, '/unauthorized');
	};
}
app.get('/account', allow('customer,employee'), function(req, res){
	res.render('account');
});
```

### Добавление дополнительных поставщиков аутентификации

 Cкопируйте идентификатор клиента и секрет клиента в ваш файл credentials.js,

 Установите passport-google
```sh
$ npm install —save passport-google-oauth
```

и добавьте следующий код в lib/auth.js:
```js
// configure Google strategy
passport.use(new GoogleStrategy({
clientID: config.google.clientID,
clientSecret: config.google.clientSecret,
callbackURL: (options.baseUrl || '') + '/auth/google/callback',
}, (token, tokenSecret, profile, done) => {
const authId = 'google:' + profile.id
db.getUserByAuthId(authId)
.then(user => {
if(user) return done(null, user)
db.addUser({
authId: authId,
name: profile.displayName,
created: new Date(),
role: 'customer',
})
.then(user => done(null, user))
.catch(err => done(err, null))
})
.catch(err => {
console.log('whoops, there was an error: ', err.message)
if(err) return done(err, null);
})
}))
```

А этот код — в метод registerRoutes:
```js
// регистрируем маршруты Google
app.get('/auth/google', (req, res, next) => {
	if(req.query.redirect) req.session.authRedirect = req.query.redirect
	passport.authenticate('google', { scope: ['profile'] })(req, res, next)
})
app.get('/auth/google/callback', passport.authenticate('google',
	{ failureRedirect: options.failureRedirect }),
	(req, res) => {
		// we only get here on successful authentication
		const redirect = req.session.authRedirect
		if(redirect) delete req.session.authRedirect
		res.redirect(303, req.query.redirect || options.successRedirect)
	}
)
```