import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/apiService';

const EditMemberPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const members = await memberService.getAll();
                const member = members.find(m => m._id === id);
                if (member) {
                    setName(member.name);
                    setEmail(member.email);
                    setCity(member.city);
                }
            } catch (error) {
                setError('Failed to fetch member details');
            }
        };
    
        fetchMember();
    }, [id]);

    const handleSave = async () => {
        try {
            await memberService.update(id, { name, email, city });
            alert('Member updated successfully!');
            navigate(`/members/edit/${member._id}`);
        } catch (err) {
            console.error('Failed to update member:', err);
            alert('Failed to update member');
        }
    };

    if (!member) return <p>Loading...</p>;

    return (
        <div>
            <h1>Edit Member</h1>
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
            <button onClick={handleSave}>Save</button>
            <button onClick={() => navigate('/members')}>Cancel</button>
        </div>
    );
};

export default EditMemberPage;
