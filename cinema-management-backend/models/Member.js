const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    city: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// וירטואל להחזרת שם מלא
memberSchema.virtual('fullName').get(function() {
    return this.name;
});

// מתודה לבדיקת המייל
memberSchema.methods.isValidEmail = function() {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(this.email);
};

// סטטית לחיפוש לפי עיר
memberSchema.statics.findByCity = function(city) {
    return this.find({ city: new RegExp(city, 'i') });
};

module.exports = mongoose.model('Member', memberSchema);