const production = {
    PORT :3000,
    DB:{
        host:"127.0.0.1",
        user:'root',
        database:'vue',
        password:'YHdusghk1210',
        port:"3306",
        connectionLimit:20,
        connectTimeout: 5000,
    },
}
const development = {
    PORT :4000,
    DB:{
        host:"127.0.0.1",
        user:'root',
        database:'vue',
        password:'YHdusghk1210',
        port:"3306",
        connectionLimit:20,
        connectTimeout: 5000,
    },
}

module.exports = { production, development }