import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from './Socket';
import { usePeer } from './Peer';

const Room = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAns,sendStream,remoteStream } = usePeer();
   const [remoteEmail,setRemoteEmail]=useState();
    const [myStream, setMyStream] = useState(null);
    const myVideoRef = useRef(null);
const remoteVideoRef = useRef(null);

    const getUserStreamMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            sendStream(stream)
            setMyStream(stream);
        } catch (err) {
            console.error("Error accessing media devices.", err);
        }
    }, []);
    useEffect(() => {
    getUserStreamMedia();
}, []);
   
   const handleNewUser = useCallback(async (data) => {
    console.log('handleNewUser got data:', data); // <-- debug here

    const { email } = data;
    if (!email) {
        console.error("handleNewUser: No email received from server");
        return;
    }

    const offer = await createOffer();
    socket.emit('call-user', { email, offer });
    setRemoteEmail(email);
}, [createOffer, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        await setRemoteAns(ans);
        console.log('Call got Accepted', ans);
    }, [setRemoteAns]);

   const handleIncomingCall = useCallback(async (data) => {
    const { from, offer } = data;
    console.log('Incoming call from', from, offer);
    
    const ans = await createAnswer(offer);
    socket.emit("call-accepted", { email: from, ans });

    // ✅ Send media after accepting call
    if (myStream) {
        sendStream(myStream);
    }
}, [createAnswer, socket, myStream, sendStream]);


    useEffect(() => {
        getUserStreamMedia();
    }, [getUserStreamMedia]);

    // ✅ Set srcObject only once when stream is available
    useEffect(() => {
    if (myVideoRef.current && myStream) {
        myVideoRef.current.srcObject = myStream;
        myVideoRef.current.play().catch(err => console.log("Play error", err));
    }
}, [myStream]);
useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
        console.log("📺 Setting remote video stream");
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((e) => console.log("remoteVideoRef play error:", e));
    }
}, [remoteStream]);
    useEffect(() => {
    peer.onicecandidate = (event) => {
        if (event.candidate && remoteEmail) {
            socket.emit('ice-candidate', {
                email: remoteEmail,
                candidate: event.candidate
            });
        }
    };
}, [peer, socket, remoteEmail]);

    useEffect(() => {
        socket.on('user-joined', handleNewUser);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUser);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        };
    }, [socket, handleNewUser, handleIncomingCall, handleCallAccepted]);
const handleNego = useCallback(async () => {
    console.log("Negotiation needed");

    const offer = await createOffer(); // this ensures localDescription is fresh
    socket.emit("call-user", { email: remoteEmail, offer });
}, [createOffer, socket, remoteEmail]);

    useEffect(()=>{
    peer.addEventListener('negotiationneeded',handleNego)
        return()=>{
             peer.removeEventListener('negotiationneeded',handleNego)

        }
    },[])
    return (
        <div className='bg-gray-900 w-[100vw] h-[100vh] flex flex-col items-center justify-center'>
            <h2 className='text-4xl font-bold text-amber-50'>Welcome to the Room</h2>
        
            <div className='w-full flex justify-around'>
                <div className='flex flex-col gap-4 '>
                    <h1 className='text-center text-5xl font-mono text-amber-50 t'>LOCAL</h1>
            <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '500px', borderRadius: '10px' }}
            />
            </div>
            <div className='flex flex-col gap-4'>
                 <h1 className='text-center text-5xl font-mono text-amber-50 t'>REMOTE</h1>
             <video
    ref={remoteVideoRef}
    autoPlay
    playsInline
    style={{ width: '500px', borderRadius: '10px' }}
/>
</div>
</div>
        </div>
    );
};

export default Room;
