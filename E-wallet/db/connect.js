const mongoose = require('mongoose');



function Connect() {

    mongoose.connect('mongodb://127.0.0.1:27017/E-wallet', {

        useNewUrlParser: true, 

        useUnifiedTopology: true

    },() => {

        console.log('Connect Mongoose Success');

    });

}



module.exports = {Connect}