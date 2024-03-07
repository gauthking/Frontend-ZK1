import axios from 'axios';

const instance = axios.create({
    baseURL: "http://ec2-3-218-238-103.compute-1.amazonaws.com", //https://zkapitypesc.onrender.com
})

export default instance
