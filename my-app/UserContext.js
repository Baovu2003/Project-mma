import {createContext,useState} from "react";

const UserType = createContext();

const UserContext = ({children}) => {
    const [userId,setUserId] = useState("");
    return (
        <UserType.Provider value={{userId,setUserId}}>
            {children}
        </UserType.Provider>
    )
}

export {UserType,UserContext};


// import React, { createContext, useState } from "react";

// export const UserType = createContext();

// export const UserProvider = ({ children }) => {
//   const [userId, setUserId] = useState("");

//   return (
//     <UserType.Provider value={{ userId, setUserId }}>
//       {children}
//     </UserType.Provider>
//   );
// };