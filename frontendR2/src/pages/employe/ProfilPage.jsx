
import Profil from "../../components/common/Profil";
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from "react";
function ProfilPage() {
      useEffect(() => {
         const token = localStorage.getItem("token");
         const user = JSON.parse(localStorage.getItem('user'));
         const userId = user?._id;
         
         // Configuration Socket.IO
         const socket = getSocket(token, userId);
  
         const handleNotification = (notification) => {
          toast.info(notification.message);
        };
        socket.on('new_notification', handleNotification);
  
  
        return () => {
        socket.off('new_notification', handleNotification);
      };
    }, []);
  return (
    <div>
      <Profil />
    </div>
  );
}

export default ProfilPage;
