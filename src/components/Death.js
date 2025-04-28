export class Death {
    constructor(imagePath = './assets/death_image.jpg') {
      this.img = document.createElement('img');
      this.img.src = imagePath;
      this.img.style.position = 'fixed';
      this.img.style.top = '50%';
      this.img.style.left = '50%';
      this.img.style.transform = 'translate(-50%, -50%)';
      this.img.style.zIndex = '9999';
      this.img.style.maxWidth = '100%';
      this.img.style.pointerEvents = 'none';
      this.img.style.display = 'none';
  
      document.body.appendChild(this.img);
    }
  
    show() {
      this.img.style.display = 'block';
    }
  
    hide() {
      this.img.style.display = 'none';
    }

    showAndWait() {
      return new Promise((resolve) => {
          this.show(); // Show the death screen
  
          setTimeout(() => {
              this.hide(); //hide it after 3 seconds
              resolve();   //continue with game reset
          }, 3000);
      });
    }
  
  }
  

  