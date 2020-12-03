//const { response } = require("express");

let db;
//create connection to indexed db
const request = indexedDB.open('pizza_hunt', 1);
//this event will emit if the database version changes: non-existant to 1, 1 to 2, etc.
request.onupgradeneeded = function(event) {
    //save a reference to the db
    const db = event.target.result;
    //create object store 'new pizza' with auto-incrementing primary key
    db.createObjectStore('new_pizza', {autoIncrement: true});
};

//on success
request.onsuccess = function(event) {
    //when db is successfully created with object store, or we've established a connection,
    //save reference to db in global variables
    db = event.target.result;

    //check if app is online. If yes, run uploadPizza() to send offline data
    if(navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    //log error
    console.log(event.target.errorCode);
};

//executes if we attempt to submit a new pizza, and connection fails
function saveRecord(record) {
    //open a new transaction and write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to your store
    pizzaObjectStore.add(record);
};

function uploadPizza() {
    //open transaction on db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //accsss object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

//on a successful .getAll() execution, run this.
getAll.onsuccess = function() {
    //if there is data, send it to the app
    if(getAll.result.length > 0) {
        fetch('/api/pizzas', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(serverResponse=>{
            if(serverResponse.message) {
                throw new Error(serverResponse);
            }

        //open one more transaction
        const transaction = db.transaction(['new_pizza'], 'readwrite');

        //access the new_pizza object store
        const pizzaObjectStore = transaction.objectStore('new_pizza');

        //clear store
        pizzaObjectStore.clear();
        alert('All saved pizzas have been submitted.');
    })
    .catch(err=>{
        console.log(err);
    });
    
}
};
};

//listen for app coming back online
window.addEventListener('online', uploadPizza);