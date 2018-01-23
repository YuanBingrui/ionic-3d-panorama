import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-threed-panorama',
  templateUrl: 'threed-panorama.html',
})
export class ThreedPanoramaPage {
	cubeImg: Array<string> = [];
  constructor(
  	public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.cubeImg = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log(this.cubeImg);
    console.log('ionViewDidLoad ThreedPanoramaPage');
  }

}
