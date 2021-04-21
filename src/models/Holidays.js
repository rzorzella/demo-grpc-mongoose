const mongoose = require('../database');

const HolidaySchema = new mongoose.Schema({

    holiday_date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    },
    createdAt: { 
        type: Date,
    },
    updatedAt: { 
        type: Date,
    },
    deletedAt: { 
        type: Date,
    },

});
 
const Holiday = mongoose.model('Holiday', HolidaySchema);
module.exports = Holiday;
