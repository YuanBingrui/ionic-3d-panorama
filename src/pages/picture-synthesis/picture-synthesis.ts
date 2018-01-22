import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-picture-synthesis',
  templateUrl: 'picture-synthesis.html',
})
export class PictureSynthesisPage {

  constructor(
  	public navCtrl: NavController
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad PictureSynthesisPage');
  }

}
