const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');




const userSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    permissions: {
        type: [String],
        default: ['View Movies']
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // הוספת שיטות עזר למודל
    methods: {
        async comparePassword(candidatePassword) {
            return await bcrypt.compare(candidatePassword, this.password);
        }
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// מידלוור להצפנת סיסמה לפני השמירה
userSchema.pre('save', async function(next) {
    // הצפן סיסמה רק אם היא שונתה
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);