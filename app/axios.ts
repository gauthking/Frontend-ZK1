import axios from 'axios';
require('dotenv').config()
const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API, 
})

export default instance
