const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// שמירת מנוי חדש
const createSubscription = async (subscriptionData) => {
    try {
        const subscription = new Subscription(subscriptionData);
        return await subscription.save();
    } catch (err) {
        console.error('Error creating subscription:', err.message);
        throw new Error('Failed to create subscription');
    }
};

// שליפת כל המנויים
const getAllSubscriptions = async () => {
    try {
        return await Subscription.find()
            .populate('memberId', 'name email')
            .populate('movies.movieId', 'name genres premiered');
    } catch (err) {
        console.error('Error fetching subscriptions:', err.message);
        throw new Error('Failed to fetch subscriptions');
    }
};

// שליפת מנויים לפי חבר
const getSubscriptionByMember = async (memberId) => {
    try {
        return await Subscription.findOne({ memberId })
            .populate('movies.movieId', 'name genres');
    } catch (err) {
        console.error('Error fetching member subscription:', err.message);
        throw new Error('Failed to fetch member subscription');
    }
};

// עדכון מנוי
const updateSubscription = async (subscriptionId, updateData) => {
    try {
        return await Subscription.findByIdAndUpdate(
            subscriptionId, 
            updateData, 
            { new: true, runValidators: true }
        );
    } catch (err) {
        console.error('Error updating subscription:', err.message);
        throw new Error('Failed to update subscription');
    }
};

// מחיקת מנוי
const deleteSubscription = async (subscriptionId) => {
    try {
        return await Subscription.findByIdAndDelete(subscriptionId);
    } catch (err) {
        console.error('Error deleting subscription:', err.message);
        throw new Error('Failed to delete subscription');
    }
};

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionByMember,
    updateSubscription,
    deleteSubscription
};