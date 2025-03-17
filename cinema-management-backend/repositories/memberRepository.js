const Member = require('../models/Member');
const Subscription = require('../models/Subscription');

// שמירת חברים ב-DB
const saveMembers = async (members) => {
    try {
        // שימוש ב-insertMany עם אפשרות של דילוג על כפילויות
        return await Member.insertMany(members, { 
            ordered: false,  // המשך גם אם יש כשל בהכנסת חלק מהרשומות
            rawResult: true  // החזר מידע נוסף על הפעולה
        });
    } catch (err) {
        console.error('Error saving members to DB:', err.message);
        throw err;
    }
};

// שליפת כל החברים
const getAllMembers = async () => {
    try {
        return await Member.find().select('-__v');
    } catch (err) {
        console.error('Error fetching members from DB:', err.message);
        throw err;
    }
};

// שליפת חבר עם המנויים שלו
const getMemberWithSubscriptions = async (memberId) => {
    try {
        const member = await Member.findById(memberId);
        
        if (!member) {
            throw new Error('Member not found');
        }

        const subscriptions = await Subscription.find({ memberId })
            .populate('movies.movieId', 'name genres');

        return {
            ...member.toObject(),
            subscriptions
        };
    } catch (err) {
        console.error('Error fetching member with subscriptions:', err.message);
        throw err;
    }
};

// עדכון חבר
const updateMember = async (id, updatedData) => {
    try {
        return await Member.findByIdAndUpdate(id, updatedData, { 
            new: true,  // החזר את הרשומה המעודכנת
            runValidators: true  // הפעל בדיקות תיקוף
        });
    } catch (err) {
        console.error('Error updating member:', err.message);
        throw err;
    }
};

// מחיקת חבר
const deleteMember = async (id) => {
    try {
        // מחיקת המנויים של החבר גם כן
        await Subscription.deleteMany({ memberId: id });
        
        return await Member.findByIdAndDelete(id);
    } catch (err) {
        console.error('Error deleting member:', err.message);
        throw err;
    }
};

module.exports = {
    saveMembers,
    getAllMembers,
    getMemberWithSubscriptions,
    updateMember,
    deleteMember
};