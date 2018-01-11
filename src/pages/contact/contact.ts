import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
	cubeImg: Array<string> = [
        '../../assets/cube/posx.jpg', '../../assets/cube/negx.jpg',
        '../../assets/cube/posy.jpg', '../../assets/cube/negy.jpg',
        '../../assets/cube/posz.jpg', '../../assets/cube/negz.jpg'
      ];
  constructor(public navCtrl: NavController) {

  }

}
