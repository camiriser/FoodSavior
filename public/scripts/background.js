var counter = 0;
function changeBG(){
    var imgs = [
        "url(https://images.unsplash.com/photo-1506368083636-6defb67639a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80)",
        "url(https://images.unsplash.com/photo-1470549813517-2fa741d25c92?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80)"
      ];
    
    if(counter === imgs.length){
        counter = 0;
        ("body").css("background-image", imgs[counter]);
    }

    counter++;
}
  
setInterval(changeBG, 2000);