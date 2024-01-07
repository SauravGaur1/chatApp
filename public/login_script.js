let contniueButton = document.getElementById('continueButton');
let username =  document.getElementById('username');
let password =  document.getElementById('password');
contniueButton.addEventListener('click',(event)=>{
    let user = {
        username: username.value,
        password: password.value
    }
    let request = new XMLHttpRequest();
    request.open('post','/login');
    request.setRequestHeader('Content-Type','application/json');
    request.addEventListener('load',()=>{
        let response = JSON.parse(request.responseText);
        if(response.status === 'success'){
            localStorage.setItem('userId',response.userId);
            localStorage.setItem('userName',response.username);
            localStorage.setItem('profileUrl',response.profileUrl);
            console.log(localStorage.getItem('userId'));
            window.location.href = '/';
        }
    });
    if(username.value && password.value)
        request.send(JSON.stringify(user));
});