import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './Socket';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [email, setEmail] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');
    const { socket } = useSocket();
    const navigate = useNavigate();

    const handleRoomJoined = useCallback(({ roomId }) => {
        setIsJoining(false);
        navigate(`/room/${roomId}`);
    }, [navigate]);

    const handleJoinError = useCallback((errorMessage) => {
        setIsJoining(false);
        setError(errorMessage);
    }, []);

    const handleRoomJoin = () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!roomId.trim()) {
            setError('Room ID is required');
            return;
        }
        
        setError('');
        setIsJoining(true);
        socket.emit('join-room', { email: email.trim(), roomId: roomId.trim() });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleRoomJoin();
        }
    };

    useEffect(() => {
        socket.on('joined-room', handleRoomJoined);
        socket.on('join-error', handleJoinError);

        return () => {
            socket.off('joined-room', handleRoomJoined);
            socket.off('join-error', handleJoinError);
        };
    }, [socket, handleRoomJoined, handleJoinError]);

    return (
        <div className='min-h-screen flex justify-center items-center flex-col gap-4 bg-gray-700 p-4'>
            <div className='w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6'>
                <h1 className='text-2xl font-bold text-white mb-6 text-center'>Join a Room</h1>
                
                {error && (
                    <div className='mb-4 p-2 bg-red-100 text-red-700 rounded text-sm'>
                        {error}
                    </div>
                )}
                
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-1'>
                            Email
                        </label>
                        <input
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500'
                            placeholder='Enter your email'
                            type='email'
                            disabled={isJoining}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor='roomId' className='block text-sm font-medium text-gray-300 mb-1'>
                            Room Code
                        </label>
                        <input
                            id='roomId'
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className='w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500'
                            placeholder='Enter room code'
                            type='text'
                            disabled={isJoining}
                        />
                    </div>
                    
                    <button
                        onClick={handleRoomJoin}
                        disabled={isJoining}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                            isJoining 
                                ? 'bg-amber-200 cursor-not-allowed' 
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                    >
                        {isJoining ? 'Joining...' : 'Enter Room'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;