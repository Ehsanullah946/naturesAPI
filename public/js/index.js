import { login, logout } from './login';
import '@babel/polyfill';

const loginForm = document.querySelector('.form');
const loggedoutBtn = document.querySelector('.nav__el--logout');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (loggedoutBtn) loggedoutBtn.addEventListener('click', logout);
