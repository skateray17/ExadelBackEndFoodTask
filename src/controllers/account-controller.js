import axios from 'axios/index';
import ExternalLinks from '../models/extrnal-links';
import UserBalance from '../models/UserBalance';
import Employee from '../models/Employee';

export default {
  login, // eslint-disable-line
  firstLogin,// eslint-disable-line
  checkLoginStatus,// eslint-disable-line
  getLoginStatus,// eslint-disable-line
};


function login(req, res, userCredential) {
  axios.post(`${ExternalLinks.rvisionLink}/security/login?username=${userCredential.username}&password=${userCredential.password}`)
    .then((rvisionRes) => {
      console.log(rvisionRes.data);
      if (rvisionRes.data.success) {
        res.setHeader('set-cookie', rvisionRes.headers['set-cookie']);
        return res.status(200).send('Success');
      }
      return res.status(403).send(rvisionRes.data.statusMsg);
    })
    .catch(() => res.status(500).end('Server Error'));
}

function firstLogin(req, res, userCredential) {
  return axios.post(`${ExternalLinks.rvisionLink}/security/login?username=${userCredential.username}&password=${userCredential.password}`)
    .then((rvisionRes) => {
      if (rvisionRes.data.success) {
        axios(`${ExternalLinks.rvisionLink}/resources/getGeneralData?id=${rvisionRes.data.userId}`, {
          headers: { Cookie: rvisionRes.headers['set-cookie'].map(el => el.split(' ')[0]).join(' ') },
          method: 'GET',
        }).then(({ data }) => {
          [data] = data.data;
          new Employee({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.login,
            id: data.id,
          }).save();
          new UserBalance({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.login,
            balance: 0,
          }).save();
        }).catch(() => res.status(502).send('Failed to load data'));
        res.setHeader('set-cookie', rvisionRes.headers['set-cookie']);
        return res.status(202).send('Success');
      }
      return res.status(403).send(rvisionRes.data.statusMsg);
    })
    .catch(() => res.status(500).end('Server Error'));
}

function checkLoginStatus(req, res, next) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.cookie },
    method: 'GET',
  }).then((response) => {
    if (response.data.loginStatus === 'loggedIn') {
      return next();
    }
    return res.status(401).end();
  }).catch(() => res.status(500).end());
}

function getLoginStatus(req) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.cookie },
    method: 'GET',
  }).then((response) => {
    if (response.data.loginStatus === 'loggedIn') {
      return Promise.resolve(response);
    }
    return Promise.reject();
  });
}
