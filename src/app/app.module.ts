import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ComponentsModule } from '../components/components.module';

import { HomePage } from '../pages/home/home';
import { PictureSynthesisPage } from '../pages/picture-synthesis/picture-synthesis';
import { ThreedPanoramaPage } from '../pages/threed-panorama/threed-panorama';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { PhotoLibrary } from '@ionic-native/photo-library';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    PictureSynthesisPage,
    ThreedPanoramaPage
  ],
  imports: [
    BrowserModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    PictureSynthesisPage,
    ThreedPanoramaPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AndroidPermissions,
    PhotoLibrary
  ]
})
export class AppModule {}
