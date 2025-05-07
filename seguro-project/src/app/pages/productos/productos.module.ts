import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ProductosPage } from './productos.page';

const routes: Routes = [
  {
    path: '',
    component: ProductosPage
  },
  {
    path: 'nuevo',
    loadChildren: () => import('./producto-form/producto-form.module').then(m => m.ProductoFormPageModule)
  },
  {
    path: 'editar/:id',
    loadChildren: () => import('./producto-form/producto-form.module').then(m => m.ProductoFormPageModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductosPage]
})
export class ProductosPageModule {}
