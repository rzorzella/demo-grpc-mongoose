const mongoose = require('../database');

const ProfessionalSchema = new mongoose.Schema({
    // _id  is implicit (type string like this: 607c8eb3ee5d40611e593954)
    professionalName: {
        type: String,
        require:  true,
    },
    professionalEmail: {
        type: String,
        require: true,
    },
    professionalPassword: {
        type: String,
        require: true,
    }
});

const Professional = mongoose.model('Professional', ProfessionalSchema);

module.exports = Professional;












