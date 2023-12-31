//////////////////////////////////////////////////////////
// Fetch Data & Call render functions to populate the DOM
//////////////////////////////////////////////////////////
const BOOKSURL = "http://localhost:3000/books"
const STORESURL = "http://localhost:3000/stores"

getJSON('http://localhost:3000/stores')
  .then((stores) => {
    // this populates a select tag with options so we can switch between stores on our web page
    renderStoreSelectionOptions(stores);
    renderHeader(stores[0])
    renderFooter(stores[0])
  })
  .catch(err => {
    console.error(err);
    // renderError('Make sure to start json-server!') // I'm skipping this so we only see this error message once if JSON-server is actually not running
  });

// load all the books and render them
getJSON("http://localhost:3000/books")
  .then((books) => {
    books.forEach(book => renderBook(book))
  })
  .catch(renderError);


///////////////////
// render functions
///////////////////
function renderHeader(bookStore) {
  document.querySelector('header h1').textContent = bookStore.name;
}

function renderFooter(bookStore) {
  document.querySelector('#address').textContent = bookStore.address;
  document.querySelector('#number').textContent = bookStore.number;
  document.querySelector('#store').textContent = bookStore.location;
}

// adds options to a select tag that allows swapping between different stores
function renderStoreSelectionOptions(stores) {
  // target the select tag
  const storeSelector = document.querySelector('#store-selector');
  // clear out any currently visible options
  storeSelector.innerHTML = "";
  // add an option to the select tag for each store
  stores.forEach(addSelectOptionForStore)
  // add a listener so that when the selection changes, we fetch that store's data from the server and load it into the DOM
  storeSelector.addEventListener('change', (e) => {
    getJSON(`http://localhost:3000/stores/${e.target.value}`)
      .then(store => {
        renderHeader(store);
        renderFooter(store);
      })
  })
}

const storeSelector = document.querySelector('#store-selector');

function addSelectOptionForStore(store) {
  const option = document.createElement('option');
  // the option value will appear within e.target.value
  option.value = store.id;
  // the options textContent will be what the user sees when choosing an option
  option.textContent = store.name;
  storeSelector.append(option);
}

function renderBook(book) {
    
  const li = document.createElement('li');
  li.className = 'list-li';
  li.setAttribute("data-id", book.id)
  
  const h3 = document.createElement('h3');
  h3.textContent = book.title;

  const pAuthor = document.createElement('p');
  pAuthor.textContent = book.author;
  
  const pPrice = document.createElement('p');
  pPrice.textContent = `${formatPrice(book.price)}`;
  
  const pStock = document.createElement('p');
  pStock.className = "grey";
  if (book.inventory === 0) {
    pStock.textContent = "Out of stock";
  } else if (book.inventory < 3) {
    pStock.textContent = "Only a few left!";
  } else {
    pStock.textContent = "In stock"
  }
  
  const img = document.createElement('img');
  img.src = book.imageUrl;
  img.alt = `${book.title} cover`;

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';

  editBtn.addEventListener('click', (e) => {
    // debugger
    //! target the modal el
    const modal = document.querySelector("#myModal")
    //! Add a class that through CSS will apply style for you
    //! To display the modal
    modal.classList.add("displayBlock")
    //! Target the edit form
    const editForm = document.querySelector("#edit-book-form")
    //! Fill in the modal
    //fillIn(editForm, book) //! Risk to access stale data
    getJSON(`http://localhost:3000/books/${book.id}`)
    .then((book) => {
      fillIn(editForm, book)
    })
    .catch(err => {
      console.error(err);
    // renderError('Make sure to start json-server!') // I'm skipping this so we only see this error message once if JSON-server is actually not running
    });

    //! Add the id of the book to the form as data-book-id
    editForm.setAttribute("data-book-id", book.id)
  })

  const btn = document.createElement('button');
  btn.textContent = 'Delete';

  btn.addEventListener('click', (e) => {
    // li.remove();
    fetch(`http://localhost:3000/books/${book.id || li.dataset.id}`, {method: "DELETE"})
    .then(response => {
      if (response.ok) { //! or check if the status code is 200 (json-server) or 204 (most servers)
        li.remove()
      }
    })
  })

  li.append(h3, pAuthor, pPrice, pStock, img, editBtn, btn);
  document.querySelector('#book-list').append(li);
}

function renderError(error) {
  const main = document.querySelector('main');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  if (error.message === "Failed to fetch") {
    errorDiv.textContent = "Whoops! Looks like you forgot to start your JSON-server!"
  } else {
    errorDiv.textContent = error;
  }
  main.prepend(errorDiv);
  window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      errorDiv.remove();
    }
  })
}

function formatPrice(price) {
  return '$' + Number.parseFloat(price).toFixed(2);
}

// fill in a form's with the data in an object
function fillIn(form, data) {
  for (field in data) {
    // use [] notation for accessing data stored 
    // in an object at variable keys, i.e. when
    // we don't know the key name up front.
    // In this case, it comes from an argument.
    if (form[field]) {
      form[field].value = data[field]
    }
  }
}

////////////////////////////////////////////////////////////////
// Event Listeners/Handlers (Behavior => Data => Display)
////////////////////////////////////////////////////////////////

// UI Events
////////////////////////////////////////////////////////////////
const toggleBookFormButton = document.querySelector('#toggleBookForm');
const bookForm = document.querySelector('#book-form');
const toggleStoreFormButton = document.querySelector('#toggleStoreForm');
const storeForm = document.querySelector('#store-form');

function toggleBookForm() {
  const bookFormHidden = bookForm.classList.toggle('collapsed');
  if (bookFormHidden) {
    toggleBookFormButton.textContent = "New Book";
  } else {
    toggleBookFormButton.textContent = "Hide Book Form";
  }
}

function toggleStoreForm() {
  const storeFormHidden = storeForm.classList.toggle('collapsed');
  if (storeFormHidden) {
    toggleStoreFormButton.textContent = "New Store";
  } else {
    toggleStoreFormButton.textContent = "Hide Store Form";
  }
}

// hide and show the new book/store form when toggle buton is clicked
toggleBookFormButton.addEventListener('click', toggleBookForm);
toggleStoreFormButton.addEventListener('click', toggleStoreForm);

// also hide both form when they're visible and the escape key is pressed

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!bookForm.classList.contains('collapsed')) {
      toggleBookForm();
    };
    if (!storeForm.classList.contains('collapsed')) {
      toggleStoreForm();
    };
  }
})

// Data persisting events
////////////////////////////////////////////////////////////////

const validateFormData = (valuesArray) => {
  return valuesArray.every(el => el.trim() !== "")
}

const handleSubmit = (e) => {
    e.preventDefault()
    // how do I extract all of the info from the form -> e.target.NAMEATTRIBUTE.value
    // how do I build ONE object out of it
    if (validateFormData([e.target.title.value, e.target.author.value, e.target.price.value, e.target.inventory.value, e.target.imageUrl.value])) {
      const newBook = {
          title: e.target.title.value,
          reviews: [],
          author: e.target.author.value,
          price: e.target.price.valueAsNumber,
          inventory: parseInt(e.target.inventory.value),
          imageUrl: e.target.imageUrl.value
      }
      //! THIS IS WHERE PERSISTANCE STARTS - OPTIMISTICALLY

      renderBook(newBook) //! Put new book in UI
      const elToRemove = document.querySelector("ul li[data-id='undefined']")
      //! Talk about the creation with the json-server
      fetch(BOOKSURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBook)
      })
      .then(response => {
        if (!response.ok) { //! if status code is not 200-299
          //! Remove it
          elToRemove.remove()
        } else {
          response.json().then(newBookWithID => {
            elToRemove.dataset.id = newBookWithID.id
          })
        }
      })
      .catch(err => {
          //! Remove it
          elToRemove.remove()
          console.log(err)
      })


      //! THIS IS WHERE PERSISTANCE STARTS - PESSIMISTICALLY
      // pessimistic rendering here:
      // postJSON("http://localhost:3000/books", newBook)
      // .then(book => {
      //   renderBook(book)
      //   e.target.reset();
      // })
      // .catch(renderError); 
      // e.target.reset() // EMPTY THE FORM


    // what do I do with the object
      e.target.reset() // EMPTY THE FORM
    } else {
      alert("Please fill out all form values!!!!")
    }
    
}

// bookForm.addEventListener('submit', e => handleSubmit(e, somethingElse))
bookForm.addEventListener('submit', handleSubmit)

// 2. Hook up the new Store form so it that it works to add a new store to our database and also to the DOM (as an option within the select tag)

// we're filling in the storeForm with some data
// for a new store programmatically so we don't 
// have to fill in the form every time we test
// the functionality
fillIn(storeForm, {
  name: "BooksRUs",
  location: "LaLaLand",
  number: "555-555-5555",
  address: "555 Shangri-La",
  hours: "Monday - Friday 9am - 6pm"
})

const editForm = document.querySelector("#edit-book-form")

const patchExistingBook = e => {
  e.preventDefault()
  if (validateFormData([e.target.title.value, e.target.author.value, e.target.price.value, e.target.inventory.value, e.target.imageUrl.value])) {
    const updatedBook = {
        title: e.target.title.value,
        author: e.target.author.value,
        price: e.target.price.valueAsNumber,
        inventory: parseInt(e.target.inventory.value),
        imageUrl: e.target.imageUrl.value
    }
    const idOfBookToPatch = e.target.dataset.bookId

    fetch(`http://localhost:3000/books/${idOfBookToPatch}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedBook)
    })
    .then(response => {
      if (response.ok) {
        response.json()
        .then(newlyUpdatedBook => {
          const elToUpdate = document.querySelector(`ul li[data-id='${newlyUpdatedBook.id}']`)
          elToUpdate.querySelector("h3").textContent = newlyUpdatedBook.title
          elToUpdate.querySelector("p:nth-child(2)").textContent = newlyUpdatedBook.author
          elToUpdate.querySelector("p:nth-child(3)").textContent = formatPrice(newlyUpdatedBook.price)
          elToUpdate.querySelector("p:nth-child(4)").textContent = newlyUpdatedBook.inventory ? "In stock" : "Out of stock"
          elToUpdate.querySelector("img").src = newlyUpdatedBook.imageUrl
          modal.classList.remove("displayBlock")
        })
      } else {
        alert("Update went wrong! Check the form and make sure there are no empty values!")
      }
    })

  }
}

//! Patch Functionality Here
const modal = document.querySelector("#myModal")

editForm.addEventListener("submit", patchExistingBook)
// When the user clicks on <span> (x), close the modal
const span = document.getElementsByClassName("close")[0];
span.addEventListener("click", function() {
  modal.classList.remove("displayBlock")
})

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function(event) {
  if (event.target == modal) {
    modal.classList.remove("displayBlock")
  }
})