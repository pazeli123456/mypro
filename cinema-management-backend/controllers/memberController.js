const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { fetchMembersFromAPI } = require('../services/memberService');
const { checkPermission } = require('../configs/authMiddleware');

// משיכת חברים מ-API ושמירה ב-DB
router.post('/fetch-members', checkPermission('Create Members'), async (req, res) => {
    try {
        const membersFromAPI = await fetchMembersFromAPI();
        const formattedMembers = membersFromAPI.map((member) => ({
            name: member.name,
            email: member.email,
            city: member.address.city
        }));

        // מנע כפילויות
        const bulkOps = formattedMembers.map(member => ({
            updateOne: {
                filter: { email: member.email },
                update: member,
                upsert: true
            }
        }));

        await Member.bulkWrite(bulkOps);
        
        res.status(201).json({ 
            message: 'Members fetched and saved successfully', 
            count: formattedMembers.length 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// יצירת חבר חדש
router.post('/', checkPermission('Create Members'), async (req, res) => {
    try {
        const { name, email, city } = req.body;

        if (!name || !email || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // בדוק אם החבר כבר קיים
        const existingMember = await Member.findOne({ email });
        if (existingMember) {
            return res.status(400).json({ error: 'Member with this email already exists' });
        }

        const newMember = new Member({ name, email, city });
        await newMember.save();
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// שליפת כל החברים
router.get('/', checkPermission('View Members'), async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// שליפת חבר לפי ID
router.get('/:id', checkPermission('View Members'), async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// עדכון חבר
router.put('/:id', checkPermission('Update Members'), async (req, res) => {
    try {
        const { name, email, city } = req.body;

        if (!name || !email || !city) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const updatedMember = await Member.findByIdAndUpdate(
            req.params.id, 
            { name, email, city }, 
            { new: true, runValidators: true }
        );

        if (!updatedMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.status(200).json(updatedMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// מחיקת חבר
router.delete('/:id', checkPermission('Delete Members'), async (req, res) => {
    try {
        const deletedMember = await Member.findByIdAndDelete(req.params.id);
        if (!deletedMember) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.status(200).json({ message: `Member with ID ${req.params.id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;