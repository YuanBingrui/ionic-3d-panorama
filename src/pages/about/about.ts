import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(
  	public navCtrl: NavController,
  	public iab: InAppBrowser
  ) {}

  showThreeDRender(){
  	this.iab.create('http://192.168.10.77/threejs/','_self','location=yes');
  }

}
