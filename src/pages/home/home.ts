import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PictureSynthesisPage } from '../picture-synthesis/picture-synthesis';
import { ThreedPanoramaPage } from '../threed-panorama/threed-panorama';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
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
  	public navCtrl: NavController
  ) {}

  gotoPictureSynthesis(){
  	this.navCtrl.push(PictureSynthesisPage, this.puzzleImg);
  }

  gotoThreedPanorama(){
  	this.navCtrl.push(ThreedPanoramaPage, this.cubeImg);
  }

}
