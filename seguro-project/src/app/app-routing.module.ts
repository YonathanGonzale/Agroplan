import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'proveedores',
    loadChildren: () => import('./pages/proveedores/proveedores.module').then(m => m.ProveedoresPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'parcelas',
    loadChildren: () => import('./pages/parcelas/parcelas.module').then(m => m.ParcelasPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'aplicadores',
    loadChildren: () => import('./pages/aplicadores/aplicadores.module').then(m => m.AplicadoresPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'aplicaciones',
    loadChildren: () => import('./pages/aplicaciones/aplicaciones.module').then(m => m.AplicacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'productos',
    loadChildren: () => import('./pages/productos/productos.module').then(m => m.ProductosPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
