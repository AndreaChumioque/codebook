$(document).ready(function() {
  // Declarando variables
  var $auth = firebase.auth();

  var $textArea = $('#write-posts');
  var $postBtn = $('#posts-btn');
  var $postsContainer = $('#posts-container');
  var uploadMessage = $('#upload-msg');
  var $file = $('#file');
  var postsRef = firebase.database().ref('posts');
  // var postedImagesRef = firebase.database().ref().child('postedImages');
  var imageUrl = null;

  // Asociando eventos
  $textArea.on('input', enablePostBtn);
  $file.on('change', enablePostBtn);
  $file.on('change', selectImage);
  $postBtn.on('click', sharePost);
   
  // Funciones

  // Previniendo que el formulario se envie (que no refresque la página)
  $('#create-post').submit(function() {
    return false;
  });

  // Agregar una imagen a Firebase Storage
  function selectImage(event) {
    var selectedFile = $(event.target).get(0).files[0];

    var storageRef = firebase.storage().ref('postedImages/' + selectedFile.name);
    var uploadTask = storageRef.put(selectedFile);

    uploadTask.on('state_changed', function(snapshot) {
      var progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      if (progress < 100) {
        uploadMessage.removeClass('text-success');
      }
      uploadMessage.html('<i class="fa fa-spinner fa-pulse"></i> <span>' + progress + '%</span>');
    }, function(error) {
      console.error(error);
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      var downloadURL = uploadTask.snapshot.downloadURL;
      var $loadedImage = $('#loaded-image');
      $loadedImage.html(`<img src="${downloadURL}" alt="${selectedFile.name}"/>`);
      uploadMessage.addClass('text-success');
      uploadMessage.html('<i class="fa fa-check" aria-hidden="true"></i> <span>100%</span>');
      
      imageUrl = downloadURL;
    });
  }

  // Publicar un post
  function enablePostBtn() {
    if ($textArea.val() && $textArea.val() !== ' ' || $file.val()) {
      $postBtn.removeAttr('disabled');
      $postBtn.css({'background': '#f7b617',
        'color': '#2b2b2b',
        'border': 'none'});
    } else {
      $postBtn.attr('disabled', true);
    }
  }
  
  function sharePost() {
    $auth.onAuthStateChanged(function(user) {
      if (user) {
        if ($textArea.val() !== ' ' || $file.val()) {
          var name = user.displayName;
          var msg = $textArea.val();
          var uid = firebase.database().ref().child('posts').push().key;

          $textArea.focus();
          $postBtn.attr('disabled', true);
          uploadMessage.removeClass('text-success');
          uploadMessage.html('');
  
          var newPost = {
            authorUid: user.uid,
            name,
            message: msg,
            image: imageUrl,
            uid: uid
          };
  
          var newPostRef = firebase.database().ref('posts/').push(newPost);
        }
      }
      $textArea.val('');
      $file.val('');
    });
  }

  postsRef.on('child_added', function(snapshot) {
    console.log(snapshot.key);
    var htmlPost = '';
    var element = snapshot.val();
    var namePost = element.name;
    var messagePost = element.message;
    var imagePost = element.image;
    var idPost = snapshot.key;
    var user = $auth.currentUser;
    var postHeader = element.authorUid === user.uid
      ? `
      <div class="card-header bg-yellowLab white-text">
        <small>Publicado por</small> <span>${namePost}</span>
        <button type="button" class="close" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      ` : `
      <div class="card-header bg-yellowLab white-text">
        <small>Publicado por</small> <span>${namePost}</span>
      </div>
      `;
    if (imagePost !== undefined && imagePost !== null) {
      console.info(imagePost);
      htmlPost = `
      <div id="${idPost}" class="card mt-3">
        ${postHeader}
        <div id="${idPost}" class="card-body">
          <p class="card-text">${messagePost}</p>
          <div class="new-post rounded-corners">
            <img class="w-100" src="${imagePost}">
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary like-btn rounded-corners">
            <i class="fa fa-heart-o" aria-hidden="true"></i>
          </button>
          <button class="btn btn-secondary rounded-corners ml-2">
            <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
    } else {
      htmlPost = `
      <div id="${idPost}" class="card del-post mt-3">
        ${postHeader}
        <div id="${idPost}" class="card-body">
          <p class="card-text">${messagePost}</p>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary like-btn rounded-corners">
            <i class="fa fa-heart-o" aria-hidden="true"></i>
          </button>
          <button class="btn btn-secondary rounded-corners ml-2">
            <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
    }

    $postsContainer.prepend(htmlPost);
  });

  $(document).on('click', '.like-btn', function() {
    console.info('click success!');

    $(this).toggleClass('btn-danger').toggleClass('btn-secondary');
  }); 

  $(document).on('click', '.close', function(event) {
    var $post = $(event.target.closest('.card'));
    var uid = $post.attr('id');
    postsRef.child(uid).remove();
  });
});