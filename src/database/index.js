const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ommed', { 
                                                    keepAlive: true,
                                                    useNewUrlParser: true, 
                                                    useUnifiedTopology: true, 
                                                    useCreateIndex: true, 
                                                    useFindAndModify: false, 
                                                    useUnifiedTopology: true,
                                                });
mongoose.Promise = global.Promise;

module.exports = mongoose;



