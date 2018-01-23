import { NgModule } from '@angular/core';
import { ThreedRendererComponent } from './threed-renderer/threed-renderer';
import { PictureCompositeComponent } from './picture-composite/picture-composite';
@NgModule({
	declarations: [ThreedRendererComponent,
    PictureCompositeComponent],
	imports: [],
	exports: [ThreedRendererComponent,
    PictureCompositeComponent]
})
export class ComponentsModule {}
