import express from "express";


let appLogger = (req, res, next)=> {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const method = req.method;
    const url = req.url;

    console.log(`[Date : ${date}] | [Time : ${time}] | [Method : ${method}] | [Url : ${url}]`);
    next();
};

export  default  appLogger;