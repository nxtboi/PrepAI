
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
    user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
    const [name, setName] = useState(user.name);
    const [targetExam, setTargetExam] = useState(user.targetExam || 'IIT JEE');
    const [currentClass, setCurrentClass] = useState(user.currentClass || '12th');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        // In a real app, this would make an API call to save the user data
        console.log('Saving profile:', { name, targetExam, currentClass });
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Profile</h2>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
                <div className="md:flex">
                    <div className="md:flex-shrink-0 bg-slate-50 flex flex-col items-center justify-center p-8">
                        <img className="h-24 w-24 rounded-full ring-4 ring-primary-200" src={`https://i.pravatar.cc/150?u=${user.email}`} alt="User Avatar" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">{user.name}</h3>
                        <p className="text-slate-500">{user.email}</p>
                        <button className="mt-4 text-sm text-primary font-semibold hover:underline">Change Picture</button>
                    </div>
                    <div className="p-8 flex-grow">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-semibold text-primary hover:text-primary-700">
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500">Email Address</label>
                                <input type="email" value={user.email} disabled className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-500">Target Exam</label>
                                <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)} disabled={!isEditing} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 p-2">
                                    <option>IIT JEE</option>
                                    <option>NEET</option>
                                    <option>CBSE Class 12</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500">Current Class</label>
                                 <select value={currentClass} onChange={(e) => setCurrentClass(e.target.value)} disabled={!isEditing} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 p-2">
                                    <option>10th</option>
                                    <option>11th</option>
                                    <option>12th</option>
                                    <option>Dropper</option>
                                </select>
                            </div>
                        </div>
                         {isEditing && (
                            <div className="mt-8 flex justify-end">
                                <button onClick={handleSave} className="px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-600">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
