import axios from 'axios';

const instance = axios.create({
    // baseURL: "https://backend.l2-zk-api.com", //https://zkapitypesc.onrender.com
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API, //https://zkapitypesc.onrender.com
})

export default instance
