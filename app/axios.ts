import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:8001", //https://zkapitypesc.onrender.com
})

export default instance