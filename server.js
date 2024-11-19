const express = require("express");
const app = express();
const port = 8004;

const fs = require('fs');
const filePath = './books.json';

app.use(express.json());

// Check if file exists, if not create it
if (!fs.existsSync(filePath)) 
{
    fs.writeFileSync(filePath, '[]');
}

// Read books from file
let books = JSON.parse(fs.readFileSync(filePath, 'utf8'));

app.get('/', (req, res)=>
    {        
        res.json(books);             
        // res.send("Hello, World!");         
    });

app.get('/books', (req, res)=>
    {        
        res.json(books);
        // res.send("Hello, World!");
    });

app.get('/books/:id', (req, res)=>
    {
        const id = req.params.id;       
        // res.send(`about/id=${id} /Hello, World!`);

        const jsonData = fs.readFileSync('books.json');
        const books = JSON.parse(jsonData);
        const book = books.find((book) => book.id == id);

        if (book) { res.send(book); }
        else { res.status(404).send({ message: 'Book not found' }); }
    });

app.get('/books/isbn/:isbn', (req, res) =>
    {
        const isbn = req.params.isbn;
        const jsonData = fs.readFileSync('books.json');
        const books = JSON.parse(jsonData);
        const book = books.find((book) => book.isbn == isbn);

        if(book){ res.send(book); }
        else { res.status(404).send({ message: 'Book with that number is not found' }); }
    });

/////////////////////////////////////

// POST /books - Create a new book
app.post('/books', (req, res) => 
    {
        console.log(req.body);
    
        const { title, author, publisher, publishedDate, isbn } = req.body;
    
        if (!title || !author || !publisher || !publishedDate || !isbn) 
        {
            return res.status(400).json({ error: 'Missing required fields' });
        }
    
        const newBook = { id: books.length+1, title, author, publisher, publishedDate, isbn };
        books.push(newBook);
        fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
        // fs.writeFileSync(filePath, books);
        res.json(newBook);
    });

// DELETE /books/:id - Delete a book by ID
app.delete('/books/:id', (req, res) => 
    {
        const id = parseInt(req.params.id); // Convert the id to a number
        const jsonData = fs.readFileSync(filePath);
        let books = JSON.parse(jsonData);
        // console.log(books);    
        
        const index = books.findIndex((book) => book.id === id);
        // console.log(index);
        if (index !== -1) 
        {
            books.splice(index, 1);
            // Write the updated array back to the JSON file
            fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
            res.status(200).send({ message: 'Book deleted successfully' });
        } else {  res.status(404).send({ message: 'Book not found' }); }
    
    });

// PUT /books/:id - Update a book by ID
app.put('/books/:id', (req, res) => 
    {
        const id = parseInt(req.params.id); // Convert the id to a number
        const jsonData = fs.readFileSync(filePath);
        let books = JSON.parse(jsonData);

        const index = books.findIndex((book) => book.id === id);

        if (index !== -1) 
        {
            // console.log(req.body);        
            // If the book is found, update its properties
            const updatedBook = { ...books[index], ...req.body };
            books[index] = updatedBook;

            console.log( updatedBook);       

            // Write the updated array back to the JSON file
            fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
            res.json(updatedBook);
        } 
        else { res.status(404).send({ message: 'Book not found' }); }
    });  


app.patch('/books/:id', (req, res) => 
    {
        const id = req.params.id;
        const book = books.find((book) => book.id === parseInt(id));
        
        if (!book) { return res.status(404).send({ message: 'Book not found' }); }
        
        const updatedBook = { ...book, ...req.body };
        books[books.indexOf(book)] = updatedBook;
        
        res.json(updatedBook);
    });


app.listen(port, () => { console.log(`Server started on port ${port}`);  });

// curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Book Title", "author": "Updated Author"}' http://localhost:8000/books/1
// curl -X POST -H "Content-Type": "application/json" -d '{"title": "New Book 2", "author": "New Author 2",  "publisher": "New Publisher 2", "publishedDate": "2023-11-19","isbn": "1234567890128"}' http://localhost:8000/books