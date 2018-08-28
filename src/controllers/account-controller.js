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
    .then(async (rvisionRes) => {
      if (rvisionRes.data.success) {
        res.setHeader('Set-cookie', rvisionRes.headers['set-cookie']);
        const { firstName, lastName } = await Employee.findOne({ email: rvisionRes.data.login });
        let type = 1;
        if (rvisionRes.data.permissions.includes('efds_admin')) { type = 10; }
        return res.status(202).send(JSON.stringify({
          cookie: rvisionRes.headers['set-cookie'], firstName, lastName, type,
        }));
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
            username: data.login,
            balance: 0,
          }).save();
        }).catch(() => res.status(502).send('Failed to load data'));
        res.setHeader('Set-cookie', rvisionRes.headers['set-cookie']);
        const { firstName, lastName } = Employee.findOne({ email: rvisionRes.data.login }).then(empl => empl);
        let type = 1;
        if (rvisionRes.data.permissions.includes('efds_admin')) { type = 10; }
        return res.status(202).send(JSON.stringify({
          cookie: rvisionRes.headers['set-cookie'], firstName, lastName, type,
        }));
      }
      return res.status(403).send(rvisionRes.data.statusMsg);
    })
    .catch(() => res.status(500).end('Server Error'));
}

function checkLoginStatus(req, res, next) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.authorization },
    method: 'GET',
  }).then((response) => {
    if (response.data.loginStatus === 'loggedIn') {
      return next();
    }
    return res.status(401).end('Login status error');
  }).catch(() => res.status(401).end('Login status error'));
}

function getLoginStatus(req, res) {
  return axios(`${ExternalLinks.rvisionLink}/security/getLoginStatus`, {
    headers: { cookie: req.headers.authorization },
    method: 'GET',
  }).then((response) => {
    if (response.data.loginStatus === 'loggedIn') {
      return Promise.resolve(response);
    }
    return res.status(401).end('Login status error');
  });
}
