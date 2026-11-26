const express = require('express');
const router = require('./routes/taskRoute');
const rateLimit = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const app=express();
// console.log(process.env)
app.get('/health',(req,res)=>{
    res.json({
        status:200,
        success:true,
    })
})
app.use(express.json());
app.use('/', rateLimit({ limit: 100, windowSec: 60 }));
app.use('/',router)
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});
app.use(errorHandler);
module.exports=app