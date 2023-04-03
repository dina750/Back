import bcrypt from 'bcryptjs'

const users = [
    {
        firstname: 'Admin',
        lastname:'User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456', 10),
        cropSelection: '',
        isAdmin: true
    },
    {
        firstname: 'Sanjula',
        lastname:'User',
        email: 'Sanjula@example.com',
        cropSelection: 'paddy',
        password: bcrypt.hashSync('123456', 10),
    },
    {
        firstname: 'Test',
        lastname:'User',
        email: 'Test@example.com',
        cropSelection: 'fruits',
        password: bcrypt.hashSync('123456', 10),
    },
]

export default users