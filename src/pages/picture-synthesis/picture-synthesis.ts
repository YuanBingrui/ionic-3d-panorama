import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-picture-synthesis',
  templateUrl: 'picture-synthesis.html',
})
export class PictureSynthesisPage {
	@ViewChild('pictureCom') pictureCom: ElementRef;

	imgUrl: string;
	puzzleImg: Array<string> = [
		'./assets/puzzle/car.png', './assets/puzzle/ceiling.png',
    './assets/puzzle/floor.png', './assets/puzzle/operating.png'
  ];
  constructor(
  	public navCtrl: NavController,
  	public alertCtrl: AlertController
  ) {}

  ionViewWillEnter() {
    console.log('ionViewDidLoad PictureSynthesisPage');
  }

  saveImgInfo(){
  	this.imgUrl = this.pictureCom.saveImageInfo();
  }

  downloadImg(){
  	if(this.imgUrl){
  		let image = this.imgUrl.replace("image/png", "image/octet-stream");
  		let save_link = <HTMLElement>document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    	save_link.href = image;
    	save_link.download = 'elevater.png';
    	let event = document.createEvent('MouseEvents');
    	event.initMouseEvent('click',true,false,window,0,0,0,0,0,false,false,false,false,0,null);
    	save_link.dispatchEvent(event);
  	}else{
  		let alert = this.alertCtrl.create({
        message: '还没有生成图片，请先生成！！！',
        buttons: ['确定']
      });
      alert.present();
  	}
  	
  }
}
