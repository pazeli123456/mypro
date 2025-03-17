const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
   name: { 
       type: String, 
       required: true,
       trim: true,
       minlength: 2,
       maxlength: 100
   },
   genres: { 
       type: [String], 
       required: true,
       validate: {
           validator: function(v) {
               return v.length > 0;
           },
           message: 'At least one genre is required'
       }
   },
   image: { 
       type: String, 
       required: true,
       validate: {
           validator: function(v) {
               // אפשר כתובות HTTP/HTTPS, כתובות יחסיות וגם מחרוזות כתמונה
               const urlRegex = /^(https?:\/\/|\/|\.\/|data:image\/)/;
               return urlRegex.test(v) || v.length > 0;
           },
           message: 'Invalid image URL or path'
       }
   },
   premiered: { 
       type: Date, 
       required: true,
       validate: {
           validator: function(v) {
               return v <= new Date();
           },
           message: 'Premiered date cannot be in the future'
       }
   }
}, {
   timestamps: true,
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
});

// וירטואל לחישוב גיל הסרט
movieSchema.virtual('age').get(function() {
   return Math.floor((Date.now() - this.premiered) / (1000 * 60 * 60 * 24 * 365));
});

// מתודה לבדיקת קיום ז'אנר
movieSchema.methods.hasGenre = function(genre) {
   return this.genres.includes(genre);
};

// סטטית לחיפוש לפי ז'אנר
movieSchema.statics.findByGenre = function(genre) {
   return this.find({ genres: genre });
};

module.exports = mongoose.model('Movie', movieSchema);