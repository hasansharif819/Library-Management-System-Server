const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfmewim.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const booksCollection = client.db('library').collection('books');
        const issueBooksCollection = client.db('library').collection("issueBooks");
        const librarianCollection = client.db('library').collection("librarian");

        // books get
  app.get("/getBooks", (req, res) => {
    booksCollection.find().toArray((err, books) => {
      res.send(books);
    });
  });

  //issue book get
  app.get("/getIssueBooks", (req, res) => {
    issueBooksCollection.find().toArray((err, issueBooks) => {
      res.send(issueBooks);
    });
  });
  // books post
  app.post("/addBook", (req, res) => {
    const newBook = req.body;
    console.log("new book", newBook);
    booksCollection.insertOne(newBook).then((result) => {
      console.log("Inserted Count ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

  //issueBooks post
  app.post("/issueBook", (req, res) => {
    const issueBook = req.body;
    console.log("Issue Book", issueBook);
    issueBooksCollection.insertOne(issueBook).then((result) => {
      console.log("Book Issue ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

  // Department books
  app.post("/booksByDepartment", (req, res) => {
    // console.log(req);
    const department = req.body.departmentName;
    // console.log("Department Name", department);
    booksCollection.find({ department }).toArray((err, books) => {
      // console.log("books", books);
      res.send(books);
    });
  });
  //add admin
  app.post("/addLibrarian", (req, res) => {
    const librarian = req.body;
    librarianCollection.insertOne(librarian).then((result) => {
      console.log("librarian ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

  //update issue book
  app.patch("/update/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    issueBooksCollection
      .updateOne(
        { _id: id },
        {
          $set: {
            bookName: req.body.bookName,
            department: req.body.department,
            issueDate: req.body.issueDate,
            returnDate: req.body.returnDate,
            roll: req.body.roll,
            semester: req.body.semester,
            studentName: req.body.studentName,
          },
        }
      )
      .then((result) => {
        console.log("Update", result);
        res.send(result.matchedCount > 0);
      });
  });

  app.delete("/itemDeleted/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    issueBooksCollection.deleteOne({ _id: id }).then((result) => {
      console.log("delete", result);
      res.send(result.deletedCount > 0);
    });
  });
}
    finally{}
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Library Management System')
});
app.listen(port, () => {
    console.log(`Library Management System ${port}`);
});
