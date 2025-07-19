import React, { useMemo } from 'react';
import { useEffect,useState,useCallback } from 'react';
const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
    const [remoteStream,setremoteStream]=useState(null);
    const peer = useMemo(
        () =>
            new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:global.stun.twilio.com:3478',
                        ],
                    },
                ],
            }),
        []
    );

    const createOffer = async () => {
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            return offer;
        } catch (error) {
            console.error('Error creating offer:', error);
            throw error;
        }
    };
    const createAnswer=async(offer)=>{
        await peer.setRemoteDescription(offer);
        const answer=await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }
    const setRemoteAns=async (ans)=>{
        await peer.setRemoteDescription(ans);
    }
    const sendStream=async(stream)=>{
        const tracks=stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track,stream)
        }
    }
    const handleTrackEvent=useCallback(()=>{
        const streams=ev.streams;
            setremoteStream(streams[0])
    },[])
     const handleNego=useCallback(()=>{
        console.log('Negogitation needed')
    })
  useEffect(() => {
    const onTrack = (event) => {
        console.log("🎥 Got remote track:", event.streams);
        if (event.streams[0]) {
            setremoteStream(event.streams[0]);
        }
    };

    peer.addEventListener('track', onTrack);

    return () => {
        peer.removeEventListener('track', onTrack);
    };
}, [peer]);


    return (
        <PeerContext.Provider value={{ peer, remoteStream,createOffer,setRemoteAns,createAnswer,sendStream }}>
            {props.children}
        </PeerContext.Provider>
    );
};