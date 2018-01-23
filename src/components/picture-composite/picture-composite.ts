import { Component, Input } from '@angular/core';

@Component({
  selector: 'picture-composite',
  templateUrl: 'picture-composite.html'
})
export class PictureCompositeComponent {
	canvas: any;
	
  @Input() 
	set puzzleImg(puzzleImg: Array<string>) {
    this.drawImg(puzzleImg);
  }

  constructor() {
    console.log('Hello PictureCompositeComponent Component');
  }

  drawImg(puzzleImg: Array<string>){
  	this.canvas = < HTMLCanvasElement > document.getElementById("canvasBox");

  	if(this.canvas.getContext('2d')){

  		let ctx = this.canvas.getContext('2d');

  		for (let i = 0; i < puzzleImg.length; i++) {
  			let img = new Image();
  			img.onload = function(){
  				ctx.drawImage(img, 0, 0, 150, 300);
  			}
    		img.src = puzzleImg[i]; 			
  		}
  	}
  	
  }

  saveImageInfo() {
    let image = this.canvas.toDataURL("image/png");
    return image;
  }

}
