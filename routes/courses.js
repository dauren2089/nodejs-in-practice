//  Роуты для курсов
const { Router } = require('express');
const Course = require('../models/course');
const router = Router();

router.get('/', async (req, res) => {
    const courses = await Course.getAll();

    res.render('courses', {
        title: 'Courses Page',
        isCourses: true,
        courses
    });
});

// Марштур для страницы "Редактировать курс"
router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }
    //получаем курс по ID (req.params.id - хранит выбранный id)
    const course = await Course.getById(req.params.id)

    res.render('edit', {
        title: `Редактировать ${course.title}`,
        course
    });
});
// мартшрут для отправки отредактированных данных
router.post('/edit', async (req, res) => {
    await Course.update(req.body);

    res.redirect('/courses')
});

router.get('/:id', async (req, res) => {
    //получаем курс по ID (req.params.id - хранит выбранный id)
    const course = await Course.getById(req.params.id)
    // для страницы Курс создан отдельный Layout
    res.render('course', {
        layout: 'course',
        title: `Курс ${course.title}`,
        course
    });
})

module.exports = router;