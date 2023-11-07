import axios from 'axios';

const instance = axios.create({
    baseURL: "https://zkapitypesc.onrender.com", //https://zkapitypesc.onrender.com
})

export default instance