import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ProveedoresService } from '../../services/proveedores.service';
import { Proveedor } from '../../interfaces/proveedor.interface';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.scss'],
})
export class ProveedoresPage implements OnInit {
  proveedores: Proveedor[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  isLoading: boolean = false;

  constructor(
    private proveedoresService: ProveedoresService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadProveedores();
  }

  loadProveedores(event?: any) {
    if (this.isLoading) return;
    this.isLoading = true;

    this.proveedoresService.getProveedores(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe(
      (response: any) => {
        if (event?.target?.complete) {
          event.target.complete();
        }
        
        const items = response.items || [];
        if (this.currentPage === 1) {
          this.proveedores = items;
        } else {
          this.proveedores = [...this.proveedores, ...items];
        }
        
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading proveedores:', error);
        this.isLoading = false;
        if (event?.target?.complete) {
          event.target.complete();
        }
      }
    );
  }

  onSearchChange(event: any) {
    this.currentPage = 1;
    this.searchTerm = event.detail.value;
    this.loadProveedores();
  }

  doRefresh(event: any) {
    this.currentPage = 1;
    this.loadProveedores(event);
  }

  loadMore(event: any) {
    this.currentPage++;
    this.loadProveedores(event);
  }

  async confirmDelete(proveedor: Proveedor) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro que desea eliminar el proveedor ${proveedor.descripcion}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteProveedor(proveedor.codigo);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProveedor(id: number) {
    this.proveedoresService.deleteProveedor(id).subscribe(
      async () => {
        const toast = await this.toastController.create({
          message: 'Proveedor eliminado exitosamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.currentPage = 1;
        this.loadProveedores();
      },
      async (error) => {
        console.error('Error deleting proveedor:', error);
        const toast = await this.toastController.create({
          message: 'Error al eliminar el proveedor',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    );
  }
}
