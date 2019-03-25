$(document).ready(function() {
  // Declarando variables
  var $regBtn = $('#reg-btn');
  var $nameInput = $('#inputName');
  var $lastInput = $('#inputLastName');
  var $checkBox = $('input[type="checkbox"]');
  var $emailInput = $('#inputEmail');
  var $passwordInput = $('#inputPassword');

  var $validateName = false;
  var $validateLast = false;
  var $validateChecked = false;
  var $validateEmail = false;
  var $validatePassword = false;

  // Asociando eventos
  $regBtn.click(register);

  // Funciones
  // Funciones para el regBtn
  function ableRegBtn() {
    if ($validateName && $validateLast && $validateChecked && $validateEmail && $validatePassword) {
      $regBtn.removeAttr('disabled');
    }
  }

  function disableRegBtn() {
    $regBtn.attr('disabled', true);
  }

  // Funciones para los input de nombre, apellido y check
  $nameInput.on('input', function() {
    console.log('HOLA');
    if ($nameInput.val().length >= 3) {
      $validateName = true;
      ableRegBtn();
      $nameInput.popover('hide');
      console.log('Nombre');
    } else {
      disableRegBtn();
      $nameInput.popover('show');
    }
  });

  $lastInput.on('input', function() {
    console.log('CHAU');
    if ($lastInput.val().length >= 3) {
      $validateLast = true;
      ableRegBtn();
      $lastInput.popover('hide');
      console.log('Apellido');
    } else {
      disableRegBtn();
      $lastInput.popover('show');
    }
  });

  $checkBox.on('click', function(event) {
    console.log(event.target.checked);
    if (event.target.checked) {
      $validateChecked = true;
      ableRegBtn();
      console.log('Check');
    } else {
      disableRegBtn();
    }
  });

  // Funciones para los input de email y password
  $emailInput.on('input', function() {
    console.log('escribiendo email');
    var $regexEmail = /^[a-zA-Z0-9\._-]+@[a-zA-Z0-9-]{2,}[.][a-zA-Z]{2,3}$/;
    console.log($regexEmail.test($(this).val()));
    if ($regexEmail.test($(this).val())) {
      $validateEmail = true;
      ableRegBtn();
      $emailInput.popover('hide');
      console.log('Email');
    } else {
      disableRegBtn();
      $emailInput.popover('show');
    }
  });

  $passwordInput.on('input', function() {
    console.log('escribiendo password');
    var $regexPassword = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z\0-9]{6,}$/;
    console.log($regexPassword.test($(this).val()));
    if ($regexPassword.test($(this).val())) {
      $validatePassword = true;
      ableRegBtn();
      $passwordInput.popover('hide');
      console.log('Password');
    } else {
      disableRegBtn();
      $passwordInput.popover('show');
    }
  });

  // Funcion para el registro de usuario al click del boton
  function register() {
    var $emailReg = $emailInput.val();
    var $passwordReg = $passwordInput.val();
  
    // Registro de Usuario (NUEVO) con email FIREBASE
    firebase.auth().createUserWithEmailAndPassword($emailReg, $passwordReg)
      .then(function(user) {
        var username = $nameInput.val() + ' ' + $lastInput.val();    
        console.log(user);
        return user.updateProfile({
          displayName: username,
          photoURL: 'https://firebasestorage.googleapis.com/v0/b/codebook-cd8c9.appspot.com/o/postedImages%2Fdefault.jpg?alt=media&token=5897a927-f9b6-4ded-9331-0dc8032ae325'
        });
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(`${errorCode}: ${errorMessage}`);
      });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        firebase.database().ref('users/' + user.uid).set({
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          profilePhoto: user.photoURL
        }).then(user => {
          window.location.href = 'home.html';
        }); 
        console.log('User is registered.');
      } else {
        console.log('Registration failed.');   
      }
    });
  }

  // Funciones para activar los popovers
  $(function() {
    $('[data-toggle="popover"]').popover();
  });

  $('.popover-dismiss').popover({
    trigger: 'focus'
  });
});
