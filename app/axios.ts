import axios from 'axios';

const instance = axios.create({
    baseURL: "http://ec2-18-204-208-138.compute-1.amazonaws.com", //https://zkapitypesc.onrender.com
})

export default instance
