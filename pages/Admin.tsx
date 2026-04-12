
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, UserGroupIcon, UserIcon, ClockIcon, MegaphoneIcon, ArrowUpCircleIcon, ExclamationTriangleIcon, SendIcon, CheckCircleIcon } from '../components/icons/Icons';
import Loader from '../components/ui/Loader';

const mockUsers = [
    { id: 1, name: 'Priya Sharma', email: 'priya.sharma@example.com', plan: 'Pro', joined: '2023-08-15', password: 'password123' },
    { id: 2, name: 'Rohan Gupta', email: 'rohan.g@example.com', plan: 'Free', joined: '2023-09-01', password: 'securePassword' },
    { id: 3, name: 'Anjali Verma', email: 'anjali.v@example.com', plan: 'Pro', joined: '2023-07-20', password: 'mySecret' },
    { id: 4, name: 'Sameer Khan', email: 'sameer.k@example.com', plan: 'Free', joined: '2023-09-10', password: 'anotherPassword' },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

const Admin: React.FC = () => {
    const [users, setUsers] = useState(mockUsers.map(u => ({ ...u, showPassword: false })));
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('Announcement');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    const togglePasswordVisibility = (id: number) => {
        setUsers(users.map(user => user.id === id ? { ...user, showPassword: !user.showPassword } : user));
    };

    const handleSendNotification = () => {
        if (!notificationMessage.trim()) return;
        setIsSending(true);
        setSendSuccess(false);

        setTimeout(() => {
            console.log('Sending notification:', { type: notificationType, message: notificationMessage });
            setIsSending(false);
            setSendSuccess(true);
            setNotificationMessage('');
            setTimeout(() => setSendSuccess(false), 4000); // Hide success message after 4s
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value="1,250" icon={<UserGroupIcon className="text-white"/>} color="bg-blue-500" />
                <StatCard title="Active Today" value="480" icon={<UserIcon className="text-white"/>} color="bg-green-500" />
                <StatCard title="Avg. Session" value="45 min" icon={<ClockIcon className="text-white"/>} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Send Notification</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="notificationType" className="block text-sm font-medium text-slate-700">Notification Type</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {notificationType === 'Announcement' && <MegaphoneIcon className="h-5 w-5 text-slate-400" />}
                                    {notificationType === 'Update' && <ArrowUpCircleIcon className="h-5 w-5 text-slate-400" />}
                                    {notificationType === 'Alert' && <ExclamationTriangleIcon className="h-5 w-5 text-slate-400" />}
                                </div>
                                <select 
                                    id="notificationType" 
                                    value={notificationType} 
                                    onChange={(e) => setNotificationType(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    <option>Announcement</option>
                                    <option>Update</option>
                                    <option>Alert</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notificationMessage" className="block text-sm font-medium text-slate-700">Message</label>
                            <textarea
                                id="notificationMessage"
                                rows={4}
                                value={notificationMessage}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSendNotification}
                                disabled={isSending || !notificationMessage.trim()}
                                className="flex items-center justify-center bg-accent text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-accent-600 transition-colors disabled:bg-slate-400"
                            >
                                {isSending ? <><Loader size="sm" /> Sending...</> : <><SendIcon /> Send</>}
                            </button>
                        </div>
                         {sendSuccess && (
                            <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-md">
                                <CheckCircleIcon className="mr-2"/>
                                <span className="text-sm font-medium">Notification sent successfully!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription Plan</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Password</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.plan === 'Pro' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {user.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.joined}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {user.showPassword ? user.password : '••••••••'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => togglePasswordVisibility(user.id)} className="text-slate-500 hover:text-slate-700 mr-4">
                                            {user.showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                                        </button>
                                        <a href="#" className="text-primary hover:text-primary-dark mr-4">Edit</a>
                                        <a href="#" className="text-red-600 hover:text-red-900">Delete</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
