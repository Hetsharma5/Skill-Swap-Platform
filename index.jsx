import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment } from '@react-three/drei';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 3D Skill Card Component
const SkillCard = ({ position, rotation, skill, onClick }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {skill.name}
      </Text>
    </group>
  );
};

// 3D User Profile Component
const UserProfile = ({ user, position }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {user.name}
      </Text>
    </group>
  );
};

// Main App Component
const App = () => {
  // State management
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [view, setView] = useState('home'); // home, profile, browse, admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: [],
    isPublic: true
  });
  const [newSkill, setNewSkill] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  // Firebase real-time listeners
  useEffect(() => {
    const skillsRef = ref(db, 'skills');
    onValue(skillsRef, (snapshot) => {
      const data = snapshot.val();
      setSkills(data ? Object.values(data) : []);
    });

    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setUsers(data ? Object.values(data) : []);
    });

    const requestsRef = ref(db, 'swapRequests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      setSwapRequests(data ? Object.values(data) : []);
    });

    // Auth state listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          ...formData
        });
        // Check if admin
        if (user.email === 'admin@skills.com') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
  }, []);

  // Auth functions
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Save user data to database
      await set(ref(db, users/${userCredential.user.uid}), {
        ...formData,
        uid: userCredential.user.uid
      });
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Skill functions
  const addSkill = (type) => {
    if (!newSkill.trim()) return;
    
    const updatedSkills = type === 'offered' 
      ? [...formData.skillsOffered, newSkill]
      : [...formData.skillsWanted, newSkill];
    
    setFormData({
      ...formData,
      [skills${type.charAt(0).toUpperCase() + type.slice(1)}]: updatedSkills
    });
    
    setNewSkill('');
    
    // Save to database if user is logged in
    if (user) {
      set(ref(db, users/${user.uid}), {
        ...formData,
        [skills${type.charAt(0).toUpperCase() + type.slice(1)}]: updatedSkills
      });
    }
  };

  // Swap request functions
  const requestSwap = (skillId) => {
    if (!user) return;
    
    const newRequest = {
      fromUserId: user.uid,
      toUserId: skills.find(s => s.id === skillId).userId,
      skillId,
      status: 'pending',
      timestamp: Date.now()
    };
    
    push(ref(db, 'swapRequests'), newRequest);
  };

  const respondToSwap = (requestId, accept) => {
    if (!user) return;
    
    const requestRef = ref(db, swapRequests/${requestId});
    set(requestRef, {
      ...swapRequests.find(r => r.id === requestId),
      status: accept ? 'accepted' : 'rejected'
    });
  };

  // Admin functions
  const sendAdminMessage = () => {
    if (!isAdmin) return;
    
    const messageRef = ref(db, 'adminMessages');
    push(messageRef, {
      message: adminMessage,
      timestamp: Date.now()
    });
    setAdminMessage('');
  };

  const banUser = (userId) => {
    if (!isAdmin) return;
    // In a real app, you'd have a banned users collection
    console.log(Banning user ${userId});
  };

  // Render functions
  const renderHome = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">Skill Swap 3D</h1>
      <p className="text-xl mb-8">Exchange skills in an immersive 3D environment</p>
      
      {!user ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Login / Sign Up</h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <div className="flex space-x-4">
              <button 
                onClick={handleLogin}
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                Login
              </button>
              <button 
                onClick={handleSignUp}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name || user.email}</h2>
          <div className="space-y-4">
            <button 
              onClick={() => setView('profile')}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              View/Edit Profile
            </button>
            <button 
              onClick={() => setView('browse')}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Browse Skills
            </button>
            {isAdmin && (
              <button 
                onClick={() => setView('admin')}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Admin Panel
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.isPublic ? 'public' : 'private'}
              onChange={(e) => setFormData({...formData, isPublic: e.target.value === 'public'})}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <div className="flex flex-wrap gap-2">
              {['Weekends', 'Weekdays', 'Mornings', 'Afternoons', 'Evenings'].map(time => (
                <button
                  key={time}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.availability.includes(time) 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => {
                    const newAvailability = formData.availability.includes(time)
                      ? formData.availability.filter(t => t !== time)
                      : [...formData.availability, time];
                    setFormData({...formData, availability: newAvailability});
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Skills Offered</h3>
        <div className="flex mb-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l"
            placeholder="Add a skill you can offer"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button 
            onClick={() => addSkill('offered')}
            className="bg-indigo-600 text-white px-4 rounded-r hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skillsOffered.map((skill, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Skills Wanted</h3>
        <div className="flex mb-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l"
            placeholder="Add a skill you want to learn"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button 
            onClick={() => addSkill('wanted')}
            className="bg-indigo-600 text-white px-4 rounded-r hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skillsWanted.map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => {
            if (user) {
              set(ref(db, users/${user.uid}), formData);
            }
            setView('home');
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Save Profile
        </button>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Browse Skills</h2>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search skills..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-medium mb-4">Available Skills</h3>
          <div className="h-96">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Environment preset="city" />
              <OrbitControls enableZoom={true} />
              
              {skills
                .filter(skill => 
                  skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  skill.userId !== user?.uid
                )
                .map((skill, index) => {
                  const angle = (index / skills.length) * Math.PI * 2;
                  const x = Math.sin(angle) * 5;
                  const z = Math.cos(angle) * 5;
                  return (
                    <SkillCard
                      key={skill.id}
                      position={[x, 0, z]}
                      rotation={[0, angle, 0]}
                      skill={skill}
                      onClick={() => requestSwap(skill.id)}
                    />
                  );
                })}
            </Canvas>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-medium mb-4">Users</h3>
          <div className="h-96">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Environment preset="city" />
              <OrbitControls enableZoom={true} />
              
              {users
                .filter(u => u.isPublic && u.uid !== user?.uid)
                .map((user, index) => {
                  const angle = (index / users.length) * Math.PI * 2;
                  const x = Math.sin(angle) * 5;
                  const z = Math.cos(angle) * 5;
                  return (
                    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                      <UserProfile
                        key={user.uid}
                        position={[x, 0, z]}
                        user={user}
                      />
                    </Float>
                  );
                })}
            </Canvas>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-medium mb-4">Your Swap Requests</h3>
        <div className="space-y-4">
          {swapRequests
            .filter(req => req.fromUserId === user?.uid || req.toUserId === user?.uid)
            .map(req => (
              <div key={req.id} className="border p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p>
                    <span className="font-medium">From:</span> {users.find(u => u.uid === req.fromUserId)?.name || 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium">To:</span> {users.find(u => u.uid === req.toUserId)?.name || 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium">Skill:</span> {skills.find(s => s.id === req.skillId)?.name || 'Unknown'}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> <span className={`${
                      req.status === 'accepted' ? 'text-green-600' :
                      req.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {req.status}
                    </span>
                  </p>
                </div>
                
                {req.toUserId === user?.uid && req.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => respondToSwap(req.id, true)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => respondToSwap(req.id, false)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {req.fromUserId === user?.uid && req.status === 'pending' && (
                  <button 
                    onClick={() => remove(ref(db, swapRequests/${req.id}))}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Send Platform Message</h3>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 border rounded-l"
            placeholder="Message to all users"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
          />
          <button 
            onClick={sendAdminMessage}
            className="bg-indigo-600 text-white px-4 rounded-r hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">User Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.uid}>
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border">{user.isPublic ? 'Public' : 'Private'}</td>
                  <td className="py-2 px-4 border">
                    <button 
                      onClick={() => banUser(user.uid)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Skill Moderation</h3>
        <div className="space-y-4">
          {skills.map(skill => (
            <div key={skill.id} className="border p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{skill.name}</p>
                <p>Posted by: {users.find(u => u.uid === skill.userId)?.name || 'Unknown'}</p>
              </div>
              <button 
                onClick={() => remove(ref(db, skills/${skill.id}))}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Swap Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <p className="text-2xl font-bold text-indigo-800">
              {swapRequests.length}
            </p>
            <p>Total Requests</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-800">
              {swapRequests.filter(r => r.status === 'accepted').length}
            </p>
            <p>Accepted</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-2xl font-bold text-red-800">
              {swapRequests.filter(r => r.status === 'rejected').length}
            </p>
            <p>Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 
            className="text-2xl font-bold cursor-pointer"
            onClick={() => setView('home')}
          >
            Skill Swap 3D
          </h1>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span>Hello, {user.name || user.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-indigo-600 px-4 py-1 rounded hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <main className="container mx-auto p-4">
        {view === 'home' && renderHome()}
        {view === 'profile' && renderProfile()}
        {view === 'browse' && renderBrowse()}
        {view === 'admin' && renderAdmin()}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© 2023 Skill Swap Platform - Odoo Hackathon Submission</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
