import React, {useEffect, useState} from "react";

import UserList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

import { useHttpClient } from "../../shared/hooks/http-hook";

const User = () => {
    // const[isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState();

    const {isLoading, error, sendRequest, clearError} = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();
    // useEffect(()=> {
    //     const sendRequest = async () => {
    //         setIsLoading(true);
    //         try{
    //             const response = await fetch(
    //                 'http://localhost:5000/api/users'
    //             );
    
    //             const responseData = await response.json();
    //             if(!response.ok){
    //                 throw new Error(responseData.message);
    //             }
    //             setLoadedUsers(responseData.users);
    //             setIsLoading(false);
    //         }catch(err){
    //             setIsLoading(false);
    //             setError(err.message);
    //         }
            
    //     }
    //     sendRequest();
    // }, []);
    
    // const errorHandler = ()=> {
    //     setError(null);
    // }

    useEffect(()=> {
        const fetchUser = async ()=> {
            try{
                const responseData = await sendRequest(
                    'http://localhost:5000/api/users'
                );

                setLoadedUsers(responseData.users);
            }catch(err){

            }
        }

        fetchUser();
    }, [sendRequest]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && 
                <div className="center">
                    <LoadingSpinner />
                </div>}
            { !isLoading && loadedUsers &&
                <UserList items={loadedUsers} />}

        </React.Fragment>
    )
}

export default User;