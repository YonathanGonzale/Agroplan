import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ProductosService, Producto } from '../../services/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];

  constructor(
    private productosService: ProductosService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadProductos();
  }

  ionViewWillEnter() {
    this.loadProductos();
  }

  loadProductos() {
    this.productosService.getProductos().subscribe(
      (data) => {
        this.productos = data;
      },
      (error) => {
        console.error('Error al cargar productos:', error);
      }
    );
  }


  async deleteProducto(registro: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.productosService.deleteProducto(registro).subscribe(
              () => {
                this.loadProductos();
              },
              (error) => {
                console.error('Error al eliminar producto:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  editProducto(registro: number) {
    this.router.navigate(['/productos/edit', registro]);
  }

  addProducto() {
    this.router.navigate(['/productos/add']);
  }
}
