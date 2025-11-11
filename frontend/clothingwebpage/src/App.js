import axios from 'axios'

// Make sure this matches Flask backend port
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

export default API
