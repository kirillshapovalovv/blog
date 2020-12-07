// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGY1X0FloEADGGIvIt-4_WpG3cX2TraL8",
  authDomain: "pikabu-clone.firebaseapp.com",
  projectId: "pikabu-clone",
  storageBucket: "pikabu-clone.appspot.com",
  messagingSenderId: "129625873098",
  appId: "1:129625873098:web:2000c7da4e106a292b3233"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


let menuToggle = document.querySelector('#menu-toggle');
let menu = document.querySelector('.sidebar');
let content = document.querySelector('.content')
// login
const loginElem = document.querySelector('.login');
// form
const loginForm = document.querySelector('.login-form');
const emailInput = document.querySelector('.login-email');
const passwordInput = document.querySelector('.login-password');
// кнопка войти
const loginSignin = document.querySelector('.login-signin');
// ссылка зарегистрироваться
const loginSignup = document.querySelector('.login-signup');
// блок user
const userElem = document.querySelector('.user');
const editUserElem = document.querySelector('.edit-container');
// username
const userNameElem = document.querySelector('.user-name');
// exit
const exitBtn = document.querySelector('.exit');
// edit
const editBtn = document.querySelector('.edit');
// edit container
const editContainer = document.querySelector('.edit-container');
// Edit username
const editUsername = document.querySelector('.edit-username');
// edit user photo
const editUserAvatar = document.querySelector('.edit-avatar');
// user avatar
const userAvatarElem = document.querySelector('.user-avatar');
// обертка всех постов
const postsWrapper = document.querySelector('.posts');
// кнопка добавить запись
const btnNewPost = document.querySelector('.button-new-post');
// элемент добавления поста
const addPostElem = document.querySelector('.add-post');
// забыли пароль?
const loginForget = document.querySelector('.login-forget');
// лайки
const iconLike = document.querySelector('.likes');
// post
const post = document.querySelector('.post');
// search input
const searchInput = document.querySelector('.search-input');
// formSearch
const searchButton = document.querySelector('.search-button');

// регулярное выражение по проверке email
// example@example.com
const regExpValidEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;



// все настройки пользователей
const setUsers = {             
  user: null,
  // инициализация пользователя с помощью слушателя Firebase
  initUser(handler) {
    firebase.auth().onAuthStateChanged(function(user) {
      // если пользователь зарегистрировался
      if(user) {
        setUsers.user = user;
      } else {
        setUsers.user = null;
      }
      if(handler) handler();
    });
  },
  // Войти
  logIn(email, password, handler) {
    // валидация email
    if(!regExpValidEmail.test(email)) return alert('Email не валиден');
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((err) => {
        let errCode = err.code;
        let errMessage = err.message;
        // если пароль неверный
        if(errCode === 'auth/wrong-password') {
          console.log(errMessage);
          alert('Неверный пароль');
        } 
        // если email занят
        else if (errCode == 'auth/user-not-found'){
          console.log(errMessage);
          alert('Пользователь не найден')
        } else {
          alert(errMessage);
        }
      });
  },
  // Выйти
  logOut(handler) {
    firebase.auth().signOut();
    loginForm.reset();

  },
  // Зарегистрироваться
  signUp(email, password, handler) {
    // если пользователь ничего не ввел
    if(!email.trim() && !password.trim()) return alert('Введите данные!');
    // валидация email
    if(!regExpValidEmail.test(email)) return alert('Email не валиден');

      // регистрация
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(data => {
        console.log(data);
        // userName
        this.editUser(email.substring(0, email.indexOf('@')), null, handler)
      })
      .catch(err => {
        let errCode = err.code;
        let errMessage = err.message;
        // если пароль слишком слабый 
        if(errCode === 'auth/weak-password') {
          console.log(errMessage);
          alert('Пароль должен быть не меньше 6 символов');
        } 
        // если email занят
        else if (errCode == 'auth/email-already-in-use'){
          console.log(errMessage);
          alert('Пользователь под таким email уже зарегистрирован')
        } else {
          alert(errMessage);
        }

        console.log(err);
      })
    },
  // изменение имени и аватарки
  editUser(displayName, photoURL, handler) {

    // current user
    let user = firebase.auth().currentUser;
    if(photoURL) {
      user.updateProfile({
        photoURL
      }).then(handler)
    }
    if(displayName) {
      user.updateProfile({
        displayName
      }).then(handler)
    };
  },
  // зброс пароля
  sendForget(email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Письмо отправлено')
      })
      .catch(err => {
        console.log(err);
      })
  },
};



// все настройки постов
const setPosts = {
  // список постов
  allPosts: [],
  addPost(title, text, tags, handler) {
    // вставляем пост пользователя в массив с постами
    this.allPosts.unshift({
      id: `postID${(+new Date()).toString(16)}-${setUsers.user.uid}`,
      title,
      text,
      tags: tags.split(',').map(item => item.trim()),
      author: {
        displayName: setUsers.user.displayName,
        avatar: setUsers.user.photoURL
      },
      date: new Date().toLocaleString(),
      likes: 0,
      comments: 0
    });
    console.log(this.allPosts);

    // добавляем посты в БД
    firebase.database().ref('post').set(this.allPosts)
      .then(() => this.getPosts(handler))
  },
  getPosts(handler) {
    firebase.database().ref('post').on('value', snapshot => {
      this.allPosts = snapshot.val() || [];
      handler();
    });
  },
  like(post, likesCounter, likes) {
    this.allPosts.forEach(item => {
      if(post.dataset.id === item.id) {
        likesCounter += 1;
        item.likes = likesCounter;
        likes = item.likes;
        console.log(this.allPosts);
        firebase.database().ref('post').set(this.allPosts)
      }
    })
  },
  // search
  search(value) {
    let arr = [];
    this.allPosts.forEach(item => {
      console.log(item);
      if(item.tags.includes(value)) {
        arr.push(item);
        showCurrentPosts(arr);
      };
    })
    console.log(arr);
  }
};

// переключатель входа
const toggleAuthDOM = () => {
  const user = setUsers.user;

  // если пользователь вошел
  if(user) {
    loginElem.style.display = 'none';
    userElem.style.display = 'flex';
    // editUserElem.style.display = 'block';
    // username
    userNameElem.textContent = user.displayName;
    // аватарка
    userAvatarElem.src = user.photoURL ? user.photoURL : userAvatarElem.src;
    // кнопка добавить пост
    btnNewPost.classList.add('visible');
    // сброс данных с формы
    editContainer.reset();

  }
  // если пользователь не вошел
  else {
    loginElem.style.display = '';
    userElem.style.display = 'none';
    // editUserElem.style.display = 'none';
    editContainer.classList.remove('visible');
    addPostElem.classList.remove('visible');
    postsWrapper.classList.add('visible');
  };
};


// показать окно добавления поста
const showAddPost = () => {
  addPostElem.classList.add('visible');
  postsWrapper.classList.remove('visible');
};


// показать все посты
const showAllPosts = () => {
  let postsHTML = '';

  setPosts.allPosts.forEach(post => {

    // получаем все значения с помощью деструктуризации
    const { title, text, date, author, likes, comments, tags, id } = post;

    postsHTML += `
      <section class="post" data-id="${id}">
        <div class="post-body">
          <h2 class="post-title">${title}</h2>
          <p class="post-text">
            ${text}
          </p>
          <div class="tags">
            ${tags.map(item => `<a href="#" class="tag">#${item}</a>`).join('')}
          </div>
        </div>
        <div class="post-footer">
          <div class="post-buttons">
            <button class="post-button likes">
              <svg width="19" height="20" class="icon icon-like">
                <use xlink:href="img/icons.svg#like"></use>
              </svg>
              <span class="likes-counter">${likes}</span>
            </button>
            <button class="post-button comments">
              <svg width="21" height="21" class="icon icon-comment">
                <use xlink:href="img/icons.svg#comment"></use>
              </svg>
              <span class="comments-counter">${comments}</span>
            </button>
            <button class="post-button save">
              <svg width="19" height="19" class="icon icon-save">
                <use xlink:href="img/icons.svg#save"></use>
              </svg>
            </button>
            <button class="post-button share">
              <svg width="17" height="19" class="icon icon-share">
                <use xlink:href="img/icons.svg#share"></use>
              </svg>
            </button>
          </div>
          <div class="post-author">
            <div class="author-about">
              <a href="#" class="author-username">${author.displayName}</a>
              <span class="post-time">${date}</span>
            </div>
            <a href="#" class="author-link"><img src="${author.avatar ? author.avatar : 'img/avatar.jpeg'}" alt="avatar" class="author-avatar"></a>
          </div>
        </div>
      </section>
    `;
  })
  
  postsWrapper.innerHTML = postsHTML;
  addPostElem.classList.remove('visible');
  postsWrapper.classList.add('visible');
  // клик по кнопке поставить лайк
  postsWrapper.addEventListener('click', (e) => {
    if(e.target.closest('.likes')) {
      let currentElement = e.target.closest('.post');
      let likesCounter = e.target.closest('.likes').querySelector('.likes-counter');
      // likesCounter.textContent = setPosts.allPosts.;
      setPosts.like(currentElement, parseInt(likesCounter.textContent), likesCounter.textContent);
    }
  });
};

// показать сортированные посты
const showCurrentPosts = (posts) => {
  let postsHTML = '';

  posts.forEach(item => {
      // получаем все значения с помощью деструктуризации
    const { title, text, date, author, likes, comments, tags, id } = item;

    postsHTML += `
      <section class="post" data-id="${id}">
        <div class="post-body">
          <h2 class="post-title">${title}</h2>
          <p class="post-text">
            ${text}
          </p>
          <div class="tags">
            ${tags.map(item => `<a href="#" class="tag">#${item}</a>`).join('')}
          </div>
        </div>
        <div class="post-footer">
          <div class="post-buttons">
            <button class="post-button likes">
              <svg width="19" height="20" class="icon icon-like">
                <use xlink:href="img/icons.svg#like"></use>
              </svg>
              <span class="likes-counter">${likes}</span>
            </button>
            <button class="post-button comments">
              <svg width="21" height="21" class="icon icon-comment">
                <use xlink:href="img/icons.svg#comment"></use>
              </svg>
              <span class="comments-counter">${comments}</span>
            </button>
            <button class="post-button save">
              <svg width="19" height="19" class="icon icon-save">
                <use xlink:href="img/icons.svg#save"></use>
              </svg>
            </button>
            <button class="post-button share">
              <svg width="17" height="19" class="icon icon-share">
                <use xlink:href="img/icons.svg#share"></use>
              </svg>
            </button>
          </div>
          <div class="post-author">
            <div class="author-about">
              <a href="#" class="author-username">${author.displayName}</a>
              <span class="post-time">${date}</span>
            </div>
            <a href="#" class="author-link"><img src="${author.avatar ? author.avatar : 'img/avatar.jpeg'}" alt="avatar" class="author-avatar"></a>
          </div>
        </div>
      </section>
    `;
  });

  postsWrapper.innerHTML = postsHTML;
};
// вызов всех функций
const init = () => {
  // при клике на кнопку войти
  loginForm.addEventListener('submit', (e) => {
    // отменяем обновление страницы
    e.preventDefault();

    // вход
    setUsers.logIn(emailInput.value, passwordInput.value, toggleAuthDOM);
    // сброс данных с кнопки
    // loginForm.reset();
  });


  // при клике на Забыли пароль?
  loginForget.addEventListener('click', (e) => {
    e.preventDefault();

    setUsers.sendForget(emailInput.value);
  });


  // клик на ссылку ЗАРЕГИСТРИРОВАТЬСЯ
  loginSignup.addEventListener('click', (e) => {
    // отменяем переход по ссылке
    e.preventDefault();

    // регистрация
    setUsers.signUp(emailInput.value, passwordInput.value, toggleAuthDOM);
    // сброс данных с кнопки
    // loginForm.reset();
  });


  // клик по кнопке выйти
  exitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    setUsers.logOut(emailInput.value, passwordInput.value, toggleAuthDOM);
    // пропадание кнопки опубликовать пост
    btnNewPost.classList.remove('visible');
    console.log('exxiiit');
  });

  

  // клик по кнопке редактировать
  editBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    userElem.classList.toggle('edit-close')
    editContainer.classList.toggle('visible');
    // в инпуте по дефолту будет записан ник пользователя
    editUsername.value = setUsers.user.displayName;

  });

  // клик по кнопке сохранить
  editContainer.addEventListener('submit', (e) => {
    e.preventDefault();
    
    setUsers.editUser(editUsername.value, editUserAvatar.value, toggleAuthDOM);
    userElem.classList.add('edit-close');
    editContainer.classList.remove('visible');
  });

  // меню
  menuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    menu.classList.toggle('visible');
  });

  // при клике на оверлей
  content.addEventListener('click', (e) => {
    if(!e.target.closest('.sidebar')) {
      menu.classList.remove('visible');
    };
  });
  
  // клик по кнопке добавить пост
  btnNewPost.addEventListener('click', (e) => {
    e.preventDefault();
    showAddPost();
  });


  // опубликовать пост
  addPostElem.addEventListener('submit', e => {
    e.preventDefault();
    // spred оператор (приводим псевдомассив в массив)
    const formElements = addPostElem.elements;
    // декструктуризация
    const { title, text, tags } = formElements;
    
    // если заголовок слишком короткий
    if(title.value.length < 6) {
      alert('Слишком короткий заголовок!');
      return;
    }
    // если пост слишком короткий
    if(text.value.length < 50) {
      alert('Слишком короткий пост!');
      return;
    }; 

    setPosts.addPost(title.value, text.value, tags.value, showAllPosts);
    
    // убираем форму добавления поста 
    addPostElem.classList.remove('visible');
    addPostElem.reset();
  });

  setUsers.initUser(toggleAuthDOM);
  // показать все посты
  setPosts.getPosts(showAllPosts);

  searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    setPosts.search(searchInput.value);
  });
}

// при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // вызвать все функции
  init();
});
