const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
//for id generation:
const { v4: uuidv4 } = require('uuid');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride("_method"));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'jeets_app',
    password: 'root@304*A90'
});
//for pushing the data:
// let q = "INSERT INTO user (id, username, email, password) VALUES(?, ?, ?, ?)";
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let users = [
//     ["123b", "123_newuserb", "abc@gmail.comb", "passbcb"],
//     ["123c", "123_newuserc", "abc@gmail.comc", "passbcc"]
// ];
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};
// let data = [];
// for(let i=0; i<100; i++){
//    data.push(getRandomUser());
// }

// connection.query(q , [data], (err, result) => {
//     if (err) {
//         console.error('Error executing query:', err);
//         return;
//     }
//     console.log('Tables in database:', result);
//     // console.log(result[1]);

// });
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//         return;
//     }
//     console.log('Connected to the database');
// });
// connection.end();
// let getRandomUser = () => {
//     return {
//         id: faker.string.uuid(),
//         username: faker.internet.userName(),
//         email: faker.internet.email(),
//         password: faker.internet.password(),
//     };
// };

// Ensure to close the connection after you're done
// connection.end();

app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            // res.send("sucess"); 
            res.render("home.ejs", { count });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in db");
    }
});

//show route:
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            // res.send("sucess"); 
            res.render("showUser.ejs", { users });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in db");
    }
});
//edit -route: only getting the form for edit
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
            //        console.log(user);
        });
    } catch (err) {
        console.log(err);
        res.send("some error in db");
    }
});
//update route:
app.patch("/user/:id", (req, res) => {
    let { password: formPassword, username: newUsername } = req.body;
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPassword != user.password) {
                res.send("wrong password");
            } else {
                let q2 = `UPDATE user SET username= '${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                })
            }
        });
    } catch (err) {
        console.log(err);
        res.send("some error in db");
    }
});
//adding new user:
app.get("/user/new", (req, res) => {
    let id = uuidv4();
    res.render("addUser.ejs", { id });
});

app.get("/render", (req, res) => {
    res.render("rendermain.ejs");
})
app.post("/user/new", (req, res) => {
    let { username, email, password, id } = req.body;
    let checkEmailQuery = 'SELECT COUNT(*) AS count FROM user WHERE email = ?';
    connection.query(checkEmailQuery, [email], (err, results) => {
        if (err) throw err;
        if (results[0].count > 0) {
            // res.send("Email already exists");
            res.redirect("/render");
        } else {
            let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
            try {
                connection.query(q, (err, result) => {
                    if (err) throw err;
                    console.log("added new user");
                    res.redirect("/user");
                });
            } catch (err) {
                res.send("some error occurred");
            }
        }
    });
});
//for deleting
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
  
  app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
app.listen("3000", () => {
    console.log("server listening at port 3000");
});