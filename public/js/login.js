import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'successfully') {
      showAlert('success', 'logged in successfuly');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    } else {
      console.log('Unexpected error:', err.message);
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'successfully') location.reload(true);
    showAlert('success', 'logged out successfuly');
  } catch (error) {
    showAlert('error', 'error logged out, please try again!');
  }
};
