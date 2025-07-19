import React from 'react'
import { useMemo,useState } from 'react'
import {io} from 'socket.io-client'
const SocketContext=React.createContext(null);
export const useSocket=()=>{
    return React.useContext(SocketContext)
}
export const SocketProvider=(props)=>{
   const socket = useMemo(() => io("https://videowebrtc-backend.onrender.com"), []);
    

    return (
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    )
}