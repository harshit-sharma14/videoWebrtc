import React from 'react'
import { useMemo,useState } from 'react'
import {io} from 'socket.io-client'
const SocketContext=React.createContext(null);
export const useSocket=()=>{
    return React.useContext(SocketContext)
}
export const SocketProvider=(props)=>{
   const socket = useMemo(() => io("http://192.168.29.135:8001"), []);

    return (
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    )
}