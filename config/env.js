require('dotenv').config()
module.exports={
    PORT:process.env.PORT,
    MONGO_URI:process.env.MONGO_URI,
    jwtSecret:process.env.JWT_SECRET,
    jwtExpiry:process.env.JWT_EXPIRES_IN_MIN,
    Redis_Url:process.env.REDIS_URL
}