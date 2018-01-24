import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, NavParams, Platform } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { PhotoLibrary } from '@ionic-native/photo-library';

@Component({
  selector: 'page-picture-synthesis',
  templateUrl: 'picture-synthesis.html',
})
export class PictureSynthesisPage {
	@ViewChild('pictureCom') pictureCom;

	imgUrl: string;
	puzzleImg: Array<string> = [];

  constructor(
  	public navCtrl: NavController,
  	public alertCtrl: AlertController,
    public navParams: NavParams,
    public platform: Platform,
    public androidPermissions: AndroidPermissions,
    public photoLibrary: PhotoLibrary
  ) {
    this.puzzleImg = this.navParams.data;
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad PictureSynthesisPage');
  }

  saveImgInfo(){
  	this.imgUrl = this.pictureCom.saveImageInfo();
  }

  saveImgToAlbum(){
    if(this.imgUrl){
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((result)=>{
        if(!result.hasPermission) {
          let alert = this.alertCtrl.create({
            message: '是否允许访问相册？',
            buttons: [
              {
                text: '取消'
              },
              {
                text: '同意',
                handler: () => {
                  this.getPermission();
                }
              }
            ]
          });
          alert.present();
        }else{
          this.saveImg();
        }
      })
    }else{
      this.tipsInfo('请先合成图片');
    }
  }

  getPermission(){
    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then((hasPermission)=>{
      if(hasPermission){
        this.saveImg();
      }else{
        this.tipsInfo('无法访问本地相册，请开放访问权限');
      }
    }).catch(err=>{
      this.tipsInfo('无法访问本地相册，请开放访问权限');
    });
  }

  saveImg(){
    this.photoLibrary.saveImage(this.imgUrl,'elevator').then((res)=>{
      this.tipsInfo('图片已保存到相册');
    }).catch(e=>{
      this.tipsInfo('图片保存错误，请重新保存');
    });
  }

  tipsInfo(message){
    let alert = this.alertCtrl.create({
      message: message,
      buttons: ['确定']
    });
    alert.present();
  }
  
}
