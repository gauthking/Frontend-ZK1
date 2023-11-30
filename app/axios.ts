import axios from 'axios';

const instance = axios.create({
    baseURL: "https://zkw-backend-api.onrender.com", //https://zkapitypesc.onrender.com
})

export default instance
