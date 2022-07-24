import React, {useState, useCallback, useEffect} from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';

import User from './users/pages/Users';
import NewPlace from './places/pages/NewPlace';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import UserPlaces from './places/pages/UserPlaces';
import UpdatePlace from './places/pages/UpdatePlace';
import Auth from './users/pages/Auth';

import { AuthContext } from './shared/context/auth-context';
import {useAuth} from './shared/hooks/auth-hook';

// let logoutTimer;

const App = () => {
  // const[token, setToken] = useState();
  // const [tokenExpirationDate, setTokenExpirationDate] = useState();
  // const [userId, setUserId] = useState();

  // const login = useCallback((uid, token, expirationDate)=> {  
  //   setToken(token);
  //   const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000*60*60);
  //   setTokenExpirationDate(tokenExpirationDate);
  //   localStorage.setItem('userData', JSON.stringify({userId: uid, token: token, expiration: tokenExpirationDate.toISOString()}));
  //   setUserId(uid);
  //   // console.log(uid);
  // }, []);

  // const logout = useCallback(()=> {  
  //   setToken(null);
  //   setTokenExpirationDate(null);
  //   setUserId(null);
  //   localStorage.removeItem('userData');
  // }, []);

  // useEffect(()=> {
  //   if(token && tokenExpirationDate){
  //     const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
  //     logoutTimer = setTimeout(logout, remainingTime);
  //   }else{
  //     clearTimeout(logoutTimer);
  //   }
  // }, [logout, token, tokenExpirationDate]);

  // useEffect(()=> {
  //   const storedData = JSON.parse(localStorage.getItem('userData'));
  //   if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
  //     login(storedData.userId, storedData.token);
  //   }
  // }, [login]);

  const {login, logout, token, userId} = useAuth();

  let routes;

  if(!token){
    routes = (
      <Switch>
        <Route path="/" exact={true}>
          <User />
        </Route>
        <Route path="/:userId/places" exact={true}>
          <UserPlaces />
        </Route>
        <Route path="/auth">
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }
  else{
    routes = (
      <Switch>
        <Route path="/" exact={true}>
          <User />
        </Route>
        <Route path="/:userId/places" exact={true}>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact={true}>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId" exact>
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  }

  return(
  <AuthContext.Provider value={{isLoggedIn: !!token, token: token, userId: userId, login: login, logout: logout}}>
    <Router>
      <MainNavigation userId={userId} />
      <main>
        <Switch>
          {routes}
        </Switch>
      </main>
    </Router>
  </AuthContext.Provider>
  
  );
}

export default App;
