const express = require('express');
const mysql = require('mysql');
const api1 = express();
const bodyParser = require('body-parser')
const router = express.Router();

api1.use(bodyParser.urlencoded({extended: false}))
api1.use(express.static('./public1'))


// connect to db
const db = mysql.createConnection({
    host        : 'localhost',
    user        : 'root',
    password    : 'Miles@123',
    database    : 'questionsdb'
});

db.connect((errme) => {
    if(errme) {
        throw errme;
    }    
    console.log('MySQL connected...');
});

api1.post('/submitquestion', (req, res) => {
    console.log("inserting a new question...")
    console.log("getting the form data...")
    console.log("Question: " + req.body.urquestion)

    const Question = req.body.urquestion
    const tags = req.body.urtags
    const urweights =  req.body.urweight

    if (Question.length == 0 || tags.length == 0 || urweights.length == 0){
        var jsonobj
        jsonobj = {
            message : "A required parameter was missing"
        }
        res.send(JSON.stringify(jsonobj));
    } else {
        const sql = "INSERT INTO questions (urquestion, qweight) VALUES (?, ?) ";
            let query = db.query(sql, [Question, urweights], (err, results, fields) => {        
                if (err){
                    console.log("Failed to insert question" + err);
                    res.sendStatus(500);
                    return;            
                }        
                console.log("Inserted new questions ID: ", results.insertId);        
                var array =  tags.split(",")        
                array.forEach(element => {
                    let sql2 = 'INSERT INTO qtags (questionID, urtags) VALUES (?, ?)';
                    let query2 = db.query(sql2, [results.insertId, element.trim()], (err1, result1) => {
                    if(err1) throw err1;
                    });
                })
                
                console.log(results.insertId)         
                let sql = `SELECT * FROM questions WHERE id = ${results.insertId}`;
                let query = db.query(sql, (err, result) => {
                if(err) throw err;
                //console.log(result[0].id);    
                var jsonobj
                jsonobj = {
                    id : result[0].id
                }
                res.send(JSON.stringify(jsonobj));
                });
            });
    }

        
});

api1.get('/urtags', (req, res) => {
    var thetags = req.query.tags;
    console.log(thetags);
    var searchme = "";

    if (Array.isArray(thetags)) {
        thetags.forEach(function(item, index, array){        
            searchme = searchme+ "'" + item +"',";
        })
        searchme = searchme.slice(0, -1);         
        console.log(searchme)
    } else {
        searchme = "'" +thetags+ "'";
    }
    let sql = `SELECT DISTINCT urquestion, q.id  FROM questionsdb.questions q INNER JOIN questionsdb.qtags t on q.id = t.questionID WHERE urtags in (${searchme}) `;
    let query = db.query(sql, (err, result, fields) => {
         if(err) throw err;
         console.log(result);    
        // res.send(result)

        var jsonobj
        jsonobj = {
            questions : result
        }
                
        if (thetags === undefined) {
            var jsonobj
            jsonobj = {
                message : "A required parameter was missing"
            }
            res.send(JSON.stringify(jsonobj));

        } else if (result === undefined || result.length == 0) {
            var jsonobj
            jsonobj = {
                message : "No Record found..."
            }
            res.send(JSON.stringify(jsonobj));
        } else {
            res.send(JSON.stringify(jsonobj));
        }
        
    })
    
});

api1.get("/allquestions", (req,res) => {
    console.log("Fetching all question");    
    const sql = 'SELECT * FROM questions';
    db.query(sql, (err, rows) => {
        if (err) {
            throw err;
        }
        console.log("fetched successfully");    
        rows.forEach(function(a){
            console.log(a.id, a.qweight);
        })
        res.end();
    });
});

api1.get('/runrandom', (req, res) => {
    console.log("Try to pick weighted questions");
    console.log("Fetching all ID and weights");
    const sql = 'SELECT * FROM questions';
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        var count = Object.keys(results).length;

        var arrayID = [];
        var i;
        var jsonobj
            
        for (i = 0; i < count; i++) {
            var qi;
            for (qi = 0; qi < results[i].qweight; qi++) {
                 console.log(results[i].qweight);
                 arrayID.push(results[i].id); 
            }
        }
        jsonobj = {
            questions : array1
            }
        res.send(JSON.stringify(jsonobj));  
    });
})

api1.post('/quiz', function(req, res){
    console.log("Fetching all ID and weights");
    const sql = 'SELECT * FROM questions';
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        console.log("fetched successfully"); 
        var count = Object.keys(results).length;

        if (req.body.noquestion > count)
        {
          process.exit();
        }
        var arrayID = [];
        var idLIST;
        var jsonobj
            
        for (idLIST = 0; idLIST < count; idLIST++) {
            var qi;
            for (qi = 0; qi < results[idLIST].qweight; qi++) {                
                 arrayID.push(results[idLIST].id); 
            }
        }

        var array1 = [];
        var i; var a = -1
        for (i = 0; i < req.body.noquestion; i++) { 
            var randindex = Math.floor(Math.random() * arrayID.length);
            var randKey = arrayID[randindex];                        
            //a = array1.indexOf(arrayID[randKey]);
            a = array1.indexOf(randKey);
            console.log(a);
            console.log(randKey);
            if (a == '-1'){
                    //rray1.push(arrayID[randindex]);
                    array1.push(randKey);                   
                    console.log(randKey);                   
                } else {                    
                    i = i - 1;                    
                }
                                
            }           
        
        var jsonobj
            jsonobj = {
            questions : array1
            }
        console.log(jsonobj)
        if (array1 === undefined || array1.length == 0) {
            var jsonobj
            jsonobj = {
            message : "A required parameter was missing"
            }
            res.send(JSON.stringify(jsonobj));  
        } else {
        res.send(JSON.stringify(jsonobj));  
        }
    });        
});

api1.get('/user/:id', (req, res) => {
    console.log("Fetching question with ID: " + req.params.id)
    const userID = req.params.id
    const sql = 'SELECT * FROM questions WHERE id = ?';
    db.query(sql, [userID], (err,  rows, fields) => {
        if (err) {
            throw err;
        }
        console.log("fetched successfully");    
        res.json(rows);
    });
});

// //create db
// api1.get('/createdb',(req, res) => {
//     let sql = 'CREATE DATABASE questionsdb';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('Database created...');
//     });
// });  

// //create table questions
// api1.get('/createquestiontable', (req, res) => {
//     let sql = 'CREATE TABLE questions(id int AUTO_INCREMENT, urquestion VARCHAR(255), qweight DECIMAL(5,2), PRIMARY KEY (id))';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('Questions table created...');
//     });
// });

// //create table tags
// api1.get('/createqtagstable', (req, res) => {
//     let sql = 'CREATE TABLE qtags(id int AUTO_INCREMENT, questionID int, urtags VARCHAR(50), PRIMARY KEY (id))';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('Question tags table created...');
//     });
// });

api1.listen('3000', () =>{
    console.log('Server started')
});
