import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API, //https://zkapitypesc.onrender.com
})

export default instance