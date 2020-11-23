const  express = require('express');
const mongoose = require('mongoose');

app = express();

const PORT = process.env.PORT || 3000

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

async function start() {
    try {
        const url = `mongodb+srv://dbUser:JEyNHlDs8fMHs6X3@cluster0.tw5x2.mongodb.net/attraction`
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start();
