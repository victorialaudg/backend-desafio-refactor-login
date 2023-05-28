import mongoose from 'mongoose';

const UserGitHubModel = mongoose.model('users', mongoose.Schema({
    email: String,
    first_name: String,
    last_name: String,
    password: String
}))

export default UserGitHubModel