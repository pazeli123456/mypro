import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberService } from '../services/apiService';

const AddMemberPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!name || !email || !city) {
                setError('All fields are required.');
                setLoading(false);
                return;
            }

            await memberService.create({ name, email, city });
            setSuccess('Member added successfully!');
            setTimeout(() => navigate('/members'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add Member</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => navigate('/members')} disabled={loading}>
                Cancel
            </button>
        </div>
    );
};

export default AddMemberPage;
