import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './Home'
import { SocketProvider } from './Socket'
import Room from './Room'
import { PeerProvider } from './Peer'
const App = () => {
  return (
    <div>
       <SocketProvider>
        <PeerProvider>
      <Routes>
       
        <Route path={'/'} element={<Home/>}/>
        <Route path={'/room/:roomID'} element={<Room/>}/>
       
      </Routes>
      </PeerProvider>
       </SocketProvider>
    </div>
  )
}

export default App