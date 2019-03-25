$(document).ready(function() {
  // Declarando variables
  var $signOutBtn = $('#sign-out');
  var $textArea = $('#write-posts');
  var $postBtn = $('#posts-btn');
  var $postsContainer = $('#posts-container');
  var uploadMessage = $('#upload-msg');
  var $file = $('#file');
  var postsRef = firebase.database().ref('posts');
  var postedImagesRef = firebase.database().ref().child('postedImages');
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
    console.info(selectedFile.name);

    var storageRef = firebase.storage().ref('postedImages/' + selectedFile.name);
    var uploadTask = storageRef.put(selectedFile);

    uploadTask.on('state_changed', function(snapshot) {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.info('Upload is ' + progress + '% done');
      
      uploadMessage.html('<i class="fa fa-spinner fa-pulse"></i> <span>' + progress + '%</span>');

      switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.info('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.info('Upload is running');
        break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {
      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      var downloadURL = uploadTask.snapshot.downloadURL;
      console.info('subió imagen');
      uploadMessage.addClass('text-success');
      uploadMessage.html('<i class="fa fa-check" aria-hidden="true"></i> <span>100%</span>');
      
      console.info(downloadURL);
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
    console.info($textArea.val());
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        if ($textArea.val() !== ' ' || $file.val()) {
          var name = user.displayName;
          var msg = $textArea.val();
          var uid = firebase.database().ref().child('posts').push().key;


          $textArea.focus();
          $postBtn.attr('disabled', true);
          uploadMessage.removeClass('text-success');
          uploadMessage.html('');
  
          // console.info(uid);
          var newPost = {
            name: user.displayName,
            message: $textArea.val(),
            image: imageUrl,
            uid: uid
          };
  
          firebase.database().ref('posts/').push(newPost);
        }
      }
      $textArea.val('');
      $file.val('');
    });
  }

  postsRef.on('child_added', function(snapshot) {
    var htmlPost = '';
    var element = snapshot.val();
    var namePost = element.name;
    var messagePost = element.message;
    var imagePost = element.image;
    var idPost = element.uid;
    
    if (imagePost !== undefined && imagePost !== null) {
      console.info(imagePost);
      htmlPost = '<div id="' + idPost + '" class="card del-post mt-3"><div class="card-header bg-yellowLab white-text"><small>Publicado por</small> <span>' + namePost + '</span> <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div id="' + idPost + '"class="card-body"><p class="card-text">' + messagePost + '</p><div class="new-post rounded-corners"><img class="w-100" src="' + imagePost + '"></div></div><div class="card-footer"><button class="btn btn-secondary like-btn rounded-corners"><i class="fa fa-heart-o" aria-hidden="true"></i></button><button class="btn btn-secondary rounded-corners ml-2"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div></div>';
    } else {
      htmlPost = '<div id="' + idPost + '" class="card del-post mt-3"><div class="card-header bg-yellowLab white-text"><small>Publicado por</small> <span>' + namePost + '</span> <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div id="' + idPost + '"class="card-body"><p class="card-text">' + messagePost + '</p></div><div class="card-footer"><button class="btn btn-secondary like-btn rounded-corners"><i class="fa fa-heart-o" aria-hidden="true"></i></button><button class="btn btn-secondary rounded-corners ml-2"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div></div>';
    }

    $postsContainer.prepend(htmlPost);
  });

  $(document).on('click', '.like-btn', function() {
    console.info('click success!');

    $(this).toggleClass('btn-danger').toggleClass('btn-secondary');
  }); 

  $(document).on('click', '.close', function() {
    console.info('close-click');
    $(this).parent().parent().remove();
  });
});