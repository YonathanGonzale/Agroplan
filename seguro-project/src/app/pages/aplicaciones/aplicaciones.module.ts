import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AplicacionesPage } from './aplicaciones.page';
import { AplicacionFormPage } from './aplicacion-form/aplicacion-form.page';
import { AplicacionDetallesComponent } from './aplicacion-detalles/aplicacion-detalles.component';
import { DetalleFormComponent } from './detalle-form/detalle-form.component';

const routes: Routes = [
  {
    path: '',
    component: AplicacionesPage
  },
  {
    path: 'crear',
    component: AplicacionFormPage
  },
  {
    path: 'editar/:id',
    component: AplicacionFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AplicacionesPage, AplicacionFormPage, AplicacionDetallesComponent, DetalleFormComponent]
})
export class AplicacionesPageModule {}
