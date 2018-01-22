import { Component } from '@angular/core';


import { HomePage } from '../home/home';
import { PictureSynthesisPage } from '../picture-synthesis/picture-synthesis';
import { ThreedPanoramaPage } from '../threed-panorama/threed-panorama';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = PictureSynthesisPage;
  tab3Root = ThreedPanoramaPage;

  constructor() {

  }
}
