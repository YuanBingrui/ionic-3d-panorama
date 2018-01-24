import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

import { PictureSynthesisPage } from '../picture-synthesis/picture-synthesis';
import { ThreedPanoramaPage } from '../threed-panorama/threed-panorama';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	testURL: string;
	puzzleImg: Array<string> = [
		'./assets/puzzle/car.png', './assets/puzzle/ceiling.png',
    './assets/puzzle/floor.png', './assets/puzzle/operating.png'
  ];
  cubeImg: Array<string> = [
		'./assets/cube/posx.jpg', './assets/cube/negx.jpg',
    './assets/cube/posy.jpg', './assets/cube/negy.jpg',
    './assets/cube/posz.jpg', './assets/cube/negz.jpg'
  ];
  constructor(
  	public navCtrl: NavController,
  	public alertCtrl: AlertController,
  	public camera: Camera,
  	public imagePicker: ImagePicker
  ) {}

  gotoPictureSynthesis(){
  	this.navCtrl.push(PictureSynthesisPage, this.puzzleImg);
  }

  gotoThreedPanorama(){
  	this.navCtrl.push(ThreedPanoramaPage, this.cubeImg);
  }

  //每次选择一张图片
  selectSingleImg(type, index){
  	// 设置选项
  	const options: CameraOptions = {
  		quality: 100,
  		sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  		destinationType: this.camera.DestinationType.DATA_URL,
  		encodingType: this.camera.EncodingType.JPEG,
  		mediaType: this.camera.MediaType.PICTURE
		}

		// 获取图片
		this.camera.getPicture(options).then((imageData) => {
			//获取成功
			this.changeImgSize(type,'data:image/jpeg;base64,' + imageData, index);
		}, (err) => {
			this.tipsInfo('获取图片失败');
		});

  }

  //选择多张图片
  selectMultipleImgs(type){
  	// 设置选项
		const options: ImagePickerOptions = {
  		maximumImagesCount: type === 'puzzle' ? 4 : 6,
  		quality: 100
		};

		// 获取图片
		this.imagePicker.getPictures(options).then((results) => {
			//获取成功
				for (let i = 0; i < results.length; i++) {
					this.changeImgSize(type, results[i], i);
  			}
		}, (err) => {
  		this.tipsInfo('获取图片失败');
		});
  }

  tipsInfo(message){
    let alert = this.alertCtrl.create({
      message: message,
      buttons: ['确定']
    });
    alert.present();
  }

  // 改变图片的真实像素大小
  changeImgSize(type, imageUrl, index){
  	let tempImg = new Image();
    this.setImgUrl(tempImg, imageUrl).then( () => {
  		let tempCanvas = document.createElement('canvas');
  		let tempCtx = tempCanvas.getContext('2d'); 
  		tempCanvas.width = type === 'puzzle' ? 1000 : 1024;
    	tempCanvas.height = type === 'puzzle' ? 2000 : 1024;

    	tempCtx.drawImage(tempImg, 0, 0, tempCanvas.width, tempCanvas.height);

    	if(type === 'puzzle'){
				this.puzzleImg[index] = tempCanvas.toDataURL("image/png");
			}else{
				this.cubeImg[index] = tempCanvas.toDataURL("image/png");
			}
    }).catch(e => console.log(e))
  }

  setImgUrl(tempImg, imageUrl){
  	return new Promise((resolve, reject) => {
    	tempImg.onload  = resolve;
    	tempImg.onerror = reject;
    	tempImg.src = imageUrl;
  	})
  }

}
