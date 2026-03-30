async function loginUser(username, password, rememberMe){

    const response = await fetch("/index", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password,
            rememberMe: rememberMe
        })
    });

    const data = await response.json();

    console.log(data);
}
