function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// for checking authentication  
function getCurrentUser(){
    const userStr = sessionStorage.getItem('currentUser');

    if (userstr){
        return JSON.parse(userStr); 
    } else{
        return null; 
    }
}

// for logoout 
function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
}

/* 
this func checks if the user exists. if it doesn't, the window redirects to index (sign in page). otherwise, it returns the user

known usage/s: 
    1. reservations.js for validation before loading reservation calendar  
*/
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}


// removes current user frm session storage 
function logout() {
    clearCurrentUser();
    window.location.href = 'index.html';
} 
